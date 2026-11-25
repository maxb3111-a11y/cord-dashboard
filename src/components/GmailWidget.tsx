"use client";

import { Mail, FileEdit } from "lucide-react";
import type { GmailItem } from "@/lib/types";

export function GmailWidget({ items }: { items: GmailItem[] }) {
  return (
    <section className="bento-card area-gmail flex flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">
            Gmail Triage &amp; Drafts
          </h2>
        </div>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[11px] text-slate-300 tabular-nums">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-xs text-slate-500">
          No pending drafts or triaged emails.
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800/80 bg-[#0b0e14]/70 p-3 transition hover:border-slate-700"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-white">
                  {item.subject}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                    item.kind === "draft"
                      ? "bg-purple-500/15 text-purple-300"
                      : "bg-cyan-500/15 text-cyan-300"
                  }`}
                >
                  {item.kind === "draft" && <FileEdit className="h-2.5 w-2.5" />}
                  {item.kind === "draft" ? "Draft" : item.date}
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-400">{item.from}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {item.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
