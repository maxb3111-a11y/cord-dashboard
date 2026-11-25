"use client";

import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";

export function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        setError("Incorrect passcode.");
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError("Connection error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] px-4">
      <div className="bento-card w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-400/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">
              C.O.R.D. Second Brain
            </h1>
            <p className="font-mono text-xs text-slate-400">
              Home Repo · Locked
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-400">
              Passcode
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter dashboard passcode"
                autoFocus
                className="w-full rounded-xl border border-slate-700/70 bg-[#0b0e14] py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 py-2.5 text-sm font-semibold text-slate-950 transition duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? "Unlocking..." : "Unlock Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
