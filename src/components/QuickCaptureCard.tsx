"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ImagePlus,
  Loader2,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { CaptureRouteResult } from "@/lib/types";

interface Props {
  onCaptured: () => void;
}

export function QuickCaptureCard({ onCaptured }: Props) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<CaptureRouteResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
        setImageMime(file.type || "image/png");
      }
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImagePreview(null);
    setImageMime(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    setSubmitting(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          imageBase64: imagePreview || undefined,
          imageMimeType: imageMime || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Failed to route capture.");
      } else {
        setResults(json.results || []);
        setText("");
        clearImage();
        onCaptured();
      }
    } catch {
      setError("Network error while routing capture.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bento-card area-capture p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-400/25">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Universal Quick Capture
            </h2>
            <p className="text-xs text-slate-400">
              Auto-routes to Google Tasks, Gmail Drafts, Calendar &amp; Obsidian Vault
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px] text-slate-400">
          <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
            TASK → Tasks + Daily
          </span>
          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-purple-300">
            IDEA → Obsidian
          </span>
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
            EMAIL → Gmail Draft
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Drop a task, email to draft, calendar event, meal plan, link, or screenshot... e.g. "Email Sam about Brighton marina renewal tomorrow 10am"'
          className="w-full resize-none rounded-xl border border-slate-700/60 bg-[#0b0e14]/90 p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
        />

        {imagePreview && (
          <div className="relative inline-flex items-center gap-3 rounded-xl border border-slate-700/70 bg-[#0b0e14] p-2 pr-8">
            <img
              src={imagePreview}
              alt="Capture attachment"
              className="h-12 w-12 rounded-lg object-cover"
            />
            <span className="font-mono text-xs text-slate-300">
              Screenshot ready for Gemini Vision
            </span>
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-[#141821] px-3 py-2 text-xs font-medium text-slate-300 transition duration-150 hover:border-cyan-400/40 hover:text-white active:scale-[0.97]"
            >
              <ImagePlus className="h-4 w-4 text-cyan-400" />
              Attach screenshot
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || (!text.trim() && !imagePreview)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-500/15 transition duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Routing with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Organise &amp; Route
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-mono text-[10px] uppercase text-cyan-300">
                  {r.actionType}
                </span>
                <span className="font-medium text-white">{r.title}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {r.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
