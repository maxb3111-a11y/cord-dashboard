"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Zap, Hourglass } from "lucide-react";
import type { TaskItem } from "@/lib/types";

function SortableTaskRow({
  task,
  rank,
  onComplete,
}: {
  task: TaskItem;
  rank: number;
  onComplete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition duration-150 ${
        isDragging
          ? "z-20 border-cyan-400/60 bg-[#1a2232] shadow-xl shadow-cyan-500/10"
          : "border-slate-800/80 bg-[#0b0e14]/70 hover:border-slate-700"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab touch-none rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onComplete(task.id)}
          aria-label={`Complete ${task.title}`}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-600 text-transparent transition duration-150 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 active:scale-[0.92]"
        >
          <Check className="h-3.5 w-3.5" />
        </button>

        <span className="shrink-0 rounded-md bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 tabular-nums">
          {task.estimatedMinutes}m
        </span>

        <span className="truncate text-sm text-slate-100">{task.title}</span>
      </div>

      <span className="shrink-0 rounded-full border border-slate-800 bg-[#141821] px-2 py-0.5 font-mono text-[10px] text-slate-400 tabular-nums">
        #{rank}
      </span>
    </div>
  );
}

export function TasksWidget({
  initialTasks,
  waitingTasks,
  onMutate,
  maxVisible,
  onViewAll,
}: {
  initialTasks: TaskItem[];
  waitingTasks: TaskItem[];
  onMutate: () => void;
  maxVisible?: number;
  onViewAll?: () => void;
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [tab, setTab] = useState<"active" | "waiting">("active");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const visibleTasks =
    maxVisible && !expanded ? tasks.slice(0, maxVisible) : tasks;
  const hiddenCount =
    maxVisible && !expanded ? Math.max(0, tasks.length - maxVisible) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = tasks.findIndex((t) => t.id === active.id);
    const newIdx = tasks.findIndex((t) => t.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(tasks, oldIdx, newIdx);
    setTasks(reordered);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        orderedIds: reordered.map((t) => t.id),
      }),
    });
  }

  async function handleComplete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", taskId }),
    });
    onMutate();
  }

  return (
    <section className="bento-card area-tasks flex flex-col p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">
            Prioritised Tasks
          </h2>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300 tabular-nums">
            {tasks.length}
          </span>
        </div>

        <div className="inline-flex rounded-lg border border-slate-800 bg-[#0b0e14] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTab("active")}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              tab === "active"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Top Focus
          </button>
          <button
            type="button"
            onClick={() => setTab("waiting")}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
              tab === "waiting"
                ? "bg-slate-800 text-amber-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Hourglass className="h-3 w-3" />
            Waiting ({waitingTasks.length})
          </button>
        </div>
      </div>

      {tab === "active" ? (
        tasks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
            All caught up — drop a task in Quick Capture above.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {visibleTasks.map((task, idx) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    rank={idx + 1}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : waitingTasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
          Nothing pending in @waiting.
        </p>
      ) : (
        <div className="space-y-2">
          {waitingTasks.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-100"
            >
              <span className="truncate">{w.title}</span>
              <span className="font-mono text-[10px] uppercase text-amber-400">
                @waiting
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "active" && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => (onViewAll ? onViewAll() : setExpanded(true))}
          className="mt-3 w-full rounded-xl border border-cyan-500/25 bg-cyan-500/10 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-500/20 active:scale-[0.98]"
        >
          View {hiddenCount} more tasks →
        </button>
      )}

      <p className="mt-3 font-mono text-[11px] text-slate-500">
        Drag handles to reprioritise · synced with Google Tasks
      </p>
    </section>
  );
}
