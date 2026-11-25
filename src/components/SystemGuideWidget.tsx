"use client";

import { useState } from "react";
import {
  BookMarked,
  Copy,
  Check,
  Terminal,
  FolderTree,
  Sparkles,
  ExternalLink,
  Wrench,
} from "lucide-react";

function CopyCommand({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#0b0e14] px-3 py-2 font-mono text-xs text-cyan-200">
      <code className="overflow-x-auto whitespace-nowrap">{cmd}</code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="Copy command"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function SystemGuideWidget() {
  return (
    <div className="space-y-4">
      {/* Links & Local Paths */}
      <section className="bento-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">
            Links &amp; Local Paths
          </h2>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <a
            href="https://github.com/maxb3111-a11y/home"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0b0e14]/80 p-3 transition hover:border-cyan-400/40"
          >
            <div>
              <p className="text-xs font-semibold text-white">
                Obsidian Vault Repo (Home)
              </p>
              <p className="font-mono text-[11px] text-slate-400">
                github.com/maxb3111-a11y/home
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-cyan-400" />
          </a>

          <a
            href="https://github.com/maxb3111-a11y/cord-dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0b0e14]/80 p-3 transition hover:border-purple-400/40"
          >
            <div>
              <p className="text-xs font-semibold text-white">
                Dashboard Code Repo
              </p>
              <p className="font-mono text-[11px] text-slate-400">
                github.com/maxb3111-a11y/cord-dashboard
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-purple-400" />
          </a>

          <div className="rounded-xl border border-slate-800 bg-[#0b0e14]/80 p-3">
            <p className="text-xs font-semibold text-white">
              Local Obsidian Vault (Home Repo)
            </p>
            <p className="mt-0.5 break-all font-mono text-[11px] text-cyan-300">
              C:\Users\Max\Documents\Obsidian Vault
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0b0e14]/80 p-3">
            <p className="text-xs font-semibold text-white">
              Local Dashboard Code
            </p>
            <p className="mt-0.5 break-all font-mono text-[11px] text-purple-300">
              C:\Users\Max\Downloads\Dashboard pro\gem\cord-dashboard
            </p>
          </div>
        </div>
      </section>

      {/* How to Ingest & Run agy */}
      <section className="bento-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">
            How to Run /ingest &amp; /health-check (agy CLI)
          </h2>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs text-slate-400">
            1. Open PowerShell inside your Home Repo and launch{" "}
            <code className="font-mono text-cyan-300">agy</code>:
          </p>
          <CopyCommand cmd='cd "C:\Users\Max\Documents\Obsidian Vault"; agy' />

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              [
                "/ingest",
                "Compiles unread files in raw-sources/ (incl. cord-captures/) into wiki/ via wiki-compiler",
              ],
              [
                "/health-check",
                "Audits wiki/ for broken wikilinks, orphans, and contradictions via vault-auditor",
              ],
              [
                "/skills reload",
                "Reloads custom skills from .agents/skills/ without restarting agy",
              ],
              [
                '/add-dir "C:\\path\\to\\repo"',
                "Attaches an external project repo from AGENTS.md to your session",
              ],
              [
                "Ctrl+P → Git: Pull",
                "Instantly pulls new phone captures from GitHub into local Obsidian",
              ],
              [
                "/schedule",
                "Sets recurring weekly /health-check runs inside agy",
              ],
            ].map(([cmd, desc]) => (
              <div
                key={cmd}
                className="rounded-xl border border-slate-800 bg-[#0b0e14]/80 p-3"
              >
                <p className="font-mono text-xs font-semibold text-cyan-300">
                  {cmd}
                </p>
                <p className="mt-1 text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capture Routing + Folder Map */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="bento-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">
              Quick Capture Auto-Routing
            </h2>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="rounded-xl border border-slate-800 bg-[#0b0e14]/70 p-2.5">
              <span className="font-mono text-cyan-300">TASK</span> → Google
              Tasks + logs <code className="font-mono">- [ ]</code> in{" "}
              <code className="font-mono">daily/YYYY-MM-DD.md</code>
            </li>
            <li className="rounded-xl border border-slate-800 bg-[#0b0e14]/70 p-2.5">
              <span className="font-mono text-purple-300">IDEA_NOTE</span> →
              YAML Markdown file in{" "}
              <code className="font-mono">raw-sources/cord-captures/</code>
            </li>
            <li className="rounded-xl border border-slate-800 bg-[#0b0e14]/70 p-2.5">
              <span className="font-mono text-emerald-300">EMAIL_DRAFT</span> →
              Formatted draft in Gmail (shows in Gmail Triage)
            </li>
            <li className="rounded-xl border border-slate-800 bg-[#0b0e14]/70 p-2.5">
              <span className="font-mono text-amber-300">EVENT</span> → Google
              Calendar + logs in{" "}
              <code className="font-mono">daily/YYYY-MM-DD.md</code>
            </li>
            <li className="rounded-xl border border-slate-800 bg-[#0b0e14]/70 p-2.5">
              <span className="font-mono text-slate-200">MEAL_PLAN</span> →
              Updates Today / Tomorrow meal slots
            </li>
          </ul>
        </section>

        <section className="bento-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">
              Vault Folders &amp; Installed Tools
            </h2>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li>
              <code className="font-mono text-amber-300">raw-sources/</code> —
              Read-only capture inbox (+ <code className="font-mono">cord-captures/</code>)
            </li>
            <li>
              <code className="font-mono text-cyan-300">wiki/</code> — AI-owned
              compiled knowledge (<code className="font-mono">index.md</code>,{" "}
              <code className="font-mono">log.md</code>)
            </li>
            <li>
              <code className="font-mono text-emerald-300">daily/</code> &amp;{" "}
              <code className="font-mono text-purple-300">templates/</code> —
              Daily Notes &amp; 1–10 effort ratings
            </li>
            <li>
              <code className="font-mono text-slate-300">.agents/</code> —
              Skills (<code className="font-mono">ingest</code>,{" "}
              <code className="font-mono">health-check</code>) &amp; Agents (
              <code className="font-mono">wiki-compiler</code>,{" "}
              <code className="font-mono">vault-auditor</code>)
            </li>
          </ul>

          <div className="mt-3 rounded-xl border border-slate-800 bg-[#0b0e14]/80 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-white">
              <Wrench className="h-3.5 w-3.5 text-cyan-400" />
              Obsidian Stack
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Obsidianite + <code className="font-mono">vault-ui.css</code> ·
              Git (2-min auto-pull) · Calendar · Tasks · Omnisearch · Tag
              Wrangler · File Explorer Note Count · File Explorer++ · Iconize
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
