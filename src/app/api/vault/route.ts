import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  appendToDailyNote,
  createCaptureNote,
  readVaultFile,
} from "@/lib/github-vault";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "wiki/index.md";
  const note = await readVaultFile(path);
  if (!note) {
    return NextResponse.json(
      { ok: false, error: "Note not found or GITHUB_TOKEN not set" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true, note });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    mode?: "daily_append" | "new_capture";
    title?: string;
    content?: string;
    section?: string;
    tags?: string[];
  };

  const content = String(body.content || "").trim();
  if (!content) {
    return NextResponse.json(
      { ok: false, error: "Content is required" },
      { status: 400 }
    );
  }

  if (body.mode === "new_capture") {
    const res = await createCaptureNote({
      title: body.title || "Quick Vault Note",
      details: content,
      tags: body.tags || ["cord-capture"],
    });
    return NextResponse.json(res, { status: res.ok ? 200 : 500 });
  }

  const res = await appendToDailyNote(
    body.section || "Wins & Notes",
    `- ${content}`
  );
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
