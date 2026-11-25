import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { postCordAction } from "@/lib/cord-api";
import { classifyCaptureWithGemini } from "@/lib/gemini-router";
import {
  appendToDailyNote,
  createCaptureNote,
  isVaultConfigured,
} from "@/lib/github-vault";
import type { CaptureRouteResult } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    imageBase64?: string;
    imageMimeType?: string;
  };

  const text = String(body.text || "").trim();
  if (!text && !body.imageBase64) {
    return NextResponse.json(
      { ok: false, error: "Provide text or an image to capture." },
      { status: 400 }
    );
  }

  const items = await classifyCaptureWithGemini({
    text,
    imageBase64: body.imageBase64,
    imageMimeType: body.imageMimeType,
  });

  const results: CaptureRouteResult[] = [];
  const vaultLive = isVaultConfigured();

  for (const item of items) {
    const destinations: string[] = [];
    const errors: string[] = [];

    if (item.actionType === "TASK") {
      const dueStr = item.dueDateIso ? ` (due ${item.dueDateIso.slice(0, 10)})` : "";
      const cordRes = await postCordAction("create_task", {
        title: item.title,
        details: item.details,
        estimatedMinutes: item.estimatedMinutes || 10,
        dueDateIso: item.dueDateIso || null,
      });
      if (cordRes.ok) {
        destinations.push(cordRes.demo ? "Google Tasks (preview)" : "Google Tasks");
      } else if (cordRes.error) {
        errors.push(cordRes.error);
      }

      if (vaultLive) {
        const vRes = await appendToDailyNote(
          "Vault / Project Tasks Captured Today",
          `- [ ] ${item.title}${dueStr} #task`
        );
        if (vRes.ok) destinations.push(`Obsidian (${vRes.path})`);
        else if (vRes.error) errors.push(vRes.error);
      } else {
        destinations.push("Obsidian daily note (preview)");
      }
    } else if (item.actionType === "EMAIL_DRAFT") {
      const cordRes = await postCordAction("create_draft", {
        recipientEmail: item.recipientEmail || "",
        title: item.title,
        details: item.details,
      });
      if (cordRes.ok) {
        destinations.push(cordRes.demo ? "Gmail Draft (preview)" : "Gmail Draft");
      } else if (cordRes.error) {
        errors.push(cordRes.error);
      }
    } else if (item.actionType === "EVENT") {
      const cordRes = await postCordAction("create_event", {
        title: item.title,
        details: item.details,
        dueDateIso: item.dueDateIso || null,
        endTimeIso: item.endTimeIso || null,
      });
      if (cordRes.ok) {
        destinations.push(
          cordRes.demo ? "Google Calendar (preview)" : "Google Calendar"
        );
      } else if (cordRes.error) {
        errors.push(cordRes.error);
      }

      if (vaultLive) {
        const timeLabel = item.dueDateIso ? `${item.dueDateIso.slice(11, 16)} — ` : "";
        const vRes = await appendToDailyNote(
          "Events & Schedule",
          `- ${timeLabel}**${item.title}**${item.details ? `: ${item.details}` : ""}`
        );
        if (vRes.ok) destinations.push(`Obsidian (${vRes.path})`);
        else if (vRes.error) errors.push(vRes.error);
      } else {
        destinations.push("Obsidian daily note (preview)");
      }
    } else if (item.actionType === "IDEA_NOTE") {
      if (vaultLive) {
        const vRes = await createCaptureNote({
          title: item.title,
          details: item.details,
          tags: item.tags,
          rawText: text,
          folder: item.folder || "raw-sources/cord-captures",
        });
        if (vRes.ok) destinations.push(`Obsidian (${vRes.path})`);
        else if (vRes.error) errors.push(vRes.error);
      } else {
        destinations.push("Obsidian raw-sources/cord-captures/ (preview)");
      }
    } else if (item.actionType === "MEAL_PLAN") {
      const cordRes = await postCordAction("set_meal", {
        title: item.title,
        mealDay: item.mealDay || "today",
        mealSlot: item.mealSlot || "dinner",
      });
      if (cordRes.ok) {
        destinations.push(cordRes.demo ? "Meal Plan (preview)" : "Meal Plan");
      } else if (cordRes.error) {
        errors.push(cordRes.error);
      }
    }

    results.push({
      actionType: item.actionType,
      title: item.title,
      destinations,
      status:
        errors.length > 0
          ? "partial"
          : destinations.some((d) => d.includes("(preview)"))
            ? "demo"
            : "ok",
      message:
        errors.length > 0
          ? errors.join("; ")
          : `Routed to ${destinations.join(" + ")}`,
    });
  }

  return NextResponse.json({ ok: true, results });
}
