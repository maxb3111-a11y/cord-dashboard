import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { postCordAction } from "@/lib/cord-api";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: "complete" | "reorder";
    taskId?: string;
    orderedIds?: string[];
  };

  if (body.action === "complete" && body.taskId) {
    const res = await postCordAction("complete_task", { taskId: body.taskId });
    return NextResponse.json(res);
  }

  if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
    const res = await postCordAction("reorder_tasks", {
      orderedIds: body.orderedIds,
    });
    return NextResponse.json(res);
  }

  return NextResponse.json(
    { ok: false, error: "Unsupported task action" },
    { status: 400 }
  );
}
