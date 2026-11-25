"use client";

import { useState } from "react";
import { BookOpen, Send, CheckCircle2, Loader2 } from "lucide-react";
import type { VaultNotePreview } from "@/lib/types";

interface Props {
  dailyPath: string;
  dailyNote: VaultNotePreview | null;
  wikiIndex: VaultNotePreview | null;
  homeNote: VaultNotePreview | null;
  vaultConnected: boolean;
  onUpdated: () => void;
}

export function VaultWidget({
  dailyPath,
  dailyNote,
  wikiIndex,
  homeNote,
  vaultConnected,
  onUpdated,
}: Props) {
  const [activeTab, setActiveTab] = useState<"daily" | "wiki" | "home">("daily");
  const [noteInput, setNoteInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const currentNote =
    activeTab === "daily"
      ? dailyNote
      : activeTab === "wiki"
        ? wikiIndex
        : homeNote;

  async function handleQuickAppend(e: React.FormEvent) {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "daily_append",
          section: "Wins & Notes",
          content: noteInput.trim(),
        }),
      });
      if (res.ok) {
        setNoteInput("");
        setSavedMsg(`Committed to ${dailyPath}`);
        onUpdated();
      } else {
        setSavedMsg("Set GITHUB_TOKEN in .env.local to write to Obsidian");
      }
    } catch {
      setSavedMsg("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bento-card bento-card-purple area-vault flex flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-400" />
          <h2 className="text-sm font-semibold text-white">Obsidian Vault</h2>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
              vaultConnected
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {vaultConnected ? "GitHub 2-Way Live" : "Preview"}
          </span>
        </div>

        <div className="inline-flex rounded-lg border border-slate-800 bg-[#0b0e14] p-0.5 text-xs">
          {(
            [
              ["daily", "Daily Log"],
              ["wiki", "Wiki Index"],
              ["home", "Home.md"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                activeTab === key
                  ? "bg-purple-500/20 text-purple-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 max-h-60 flex-1 overflow-y-auto rounded-xl border border-slate-800/80 bg-[#0b0e14]/90 p-3.5 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
        {currentNote?.content ||
          `No file yet at ${dailyPath}. Add a quick note below to create it automatically.`}
      </div>

      <form onSubmit={handleQuickAppend} className="flex gap-2">
        <input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder={`Append bullet to ${dailyPath}...`}
          className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-[#0b0e14] px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition focus:border-purple-400/60"
        />
        <button
          type="submit"
          disabled={saving || !noteInput.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-200 ring-1 ring-purple-400/30 transition hover:bg-purple-500/30 active:scale-[0.97] disabled:opacity-40"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Log
        </button>
      </form>

      {savedMsg && (
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {savedMsg}
        </p>
      )}
    </section>
  );
}
