"use client";

import { CalendarDays, UtensilsCrossed } from "lucide-react";
import type { CalendarEvent, DayMeals } from "@/lib/types";

export function ScheduleWidget({ events }: { events: CalendarEvent[] }) {
  return (
    <section className="bento-card area-schedule flex flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">
            Today&apos;s Schedule
          </h2>
        </div>
        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
          {events.length} event{events.length === 1 ? "" : "s"}
        </span>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-xs text-slate-500">
          No events scheduled today.
        </p>
      ) : (
        <div className="space-y-2.5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-[#0b0e14]/70 p-3"
            >
              <div className="shrink-0 rounded-lg bg-purple-500/15 px-2 py-1 font-mono text-[11px] text-purple-200 tabular-nums">
                {ev.start}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {ev.title}
                </p>
                {ev.location && (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {ev.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function MealsWidget({
  meals,
}: {
  meals: { today: DayMeals; tomorrow: DayMeals };
}) {
  return (
    <section className="bento-card area-meals flex flex-col p-5">
      <div className="mb-3 flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4 text-emerald-400" />
        <h2 className="text-sm font-semibold text-white">
          Meals &amp; Routine
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {[meals.today, meals.tomorrow].map((day, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800/80 bg-[#0b0e14]/70 p-3"
          >
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              {day.dayLabel}
            </p>
            <dl className="space-y-1.5 text-xs">
              <div>
                <dt className="text-[10px] text-slate-500">Breakfast</dt>
                <dd className="text-slate-200">{day.breakfast}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500">Lunch</dt>
                <dd className="text-slate-200">{day.lunch}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-slate-500">Dinner</dt>
                <dd className="text-slate-200">{day.dinner}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
