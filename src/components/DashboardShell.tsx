"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LayoutGrid,
  CheckSquare,
  BookOpen,
  Mail,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  LogOut,
  Wifi,
} from "lucide-react";
import type { DashboardData } from "@/lib/types";
import { QuickCaptureCard } from "./QuickCaptureCard";
import { TasksWidget } from "./TasksWidget";
import { VaultWidget } from "./VaultWidget";
import { GmailWidget } from "./GmailWidget";
import { TidesWeatherWidget } from "./TidesWeatherWidget";
import { MealsWidget, ScheduleWidget } from "./ScheduleMealsWidget";

type SectionFilter = "overview" | "tasks" | "vault" | "comms";

export function DashboardShell({ authRequired }: { authRequired: boolean }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState<SectionFilter>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as DashboardData;
        setData(json);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(() => loadDashboard(), 60_000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  }

  const navItems: Array<{
    id: SectionFilter;
    label: string;
    icon: typeof LayoutGrid;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    {
      id: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      badge: data?.tasks.length,
    },
    { id: "vault", label: "Obsidian Vault", icon: BookOpen },
    {
      id: "comms",
      label: "Gmail & Schedule",
      icon: Mail,
      badge: data?.gmail.length,
    },
  ];

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 text-cyan-300 ring-1 ring-cyan-400/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">
              C.O.R.D.
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Second Brain · Home Repo
            </div>
          </div>
        </div>

        <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Workspace
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition duration-150 ${
                  active
                    ? "bg-slate-800/90 text-white ring-1 ring-cyan-400/25"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      active ? "text-cyan-400" : "text-slate-500"
                    }`}
                  />
                  {item.label}
                </span>
                {typeof item.badge === "number" && (
                  <span className="rounded-md bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <div className="rounded-xl border border-slate-800/80 bg-[#0b0e14]/80 p-3 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-cyan-400" />
              Sync Status
            </span>
            <span
              className={
                data?.mode === "live" ? "text-emerald-400" : "text-amber-300"
              }
            >
              {data?.mode === "live" ? "Live" : "Preview"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Obsidian Git</span>
            <span>{data?.vaultConnected ? "Connected" : "Set Token"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Google API</span>
            <span>{data?.cordConnected ? "Connected" : "Set URL"}</span>
          </div>
        </div>

        {authRequired && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 py-2 text-xs text-slate-400 transition hover:border-slate-700 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Lock Dashboard
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0b0e14] text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-800/80 bg-[#0f131b] lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 border-r border-slate-800 bg-[#0f131b]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0b0e14]/85 px-4 py-3 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-slate-800 p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white">
                Today at a glance
              </h1>
              <p className="font-mono text-[11px] text-slate-400">
                Brighton &amp; Hove ·{" "}
                {data?.syncedAt
                  ? `Synced ${new Date(data.syncedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Syncing..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#141821] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:text-white active:scale-[0.97]"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-cyan-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Sync
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-6">
          {loading || !data ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bento-card h-48 animate-pulse bg-slate-900/50"
                />
              ))}
            </div>
          ) : section === "overview" ? (
            <div className="bento-grid">
              <QuickCaptureCard onCaptured={() => loadDashboard(true)} />
              <TidesWeatherWidget weather={data.weather} />
              <TasksWidget
                initialTasks={data.tasks}
                waitingTasks={data.waitingTasks}
                maxVisible={5}
                onViewAll={() => setSection("tasks")}
                onMutate={() => loadDashboard()}
              />
              <VaultWidget
                dailyPath={data.vault.dailyPath}
                dailyNote={data.vault.dailyNote}
                wikiIndex={data.vault.wikiIndex}
                homeNote={data.vault.homeNote}
                vaultConnected={data.vaultConnected}
                onUpdated={() => loadDashboard(true)}
              />
              <GmailWidget items={data.gmail} />
              <ScheduleWidget events={data.events} />
              <MealsWidget meals={data.meals} />
            </div>
          ) : section === "tasks" ? (
            <div className="space-y-4">
              <QuickCaptureCard onCaptured={() => loadDashboard(true)} />
              <TasksWidget
                initialTasks={data.tasks}
                waitingTasks={data.waitingTasks}
                onMutate={() => loadDashboard()}
              />
            </div>
          ) : section === "vault" ? (
            <div className="space-y-4">
              <QuickCaptureCard onCaptured={() => loadDashboard(true)} />
              <VaultWidget
                dailyPath={data.vault.dailyPath}
                dailyNote={data.vault.dailyNote}
                wikiIndex={data.vault.wikiIndex}
                homeNote={data.vault.homeNote}
                vaultConnected={data.vaultConnected}
                onUpdated={() => loadDashboard(true)}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <GmailWidget items={data.gmail} />
              <ScheduleWidget events={data.events} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
