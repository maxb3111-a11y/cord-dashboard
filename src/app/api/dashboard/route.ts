import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { fetchCordData } from "@/lib/cord-api";
import {
  getTodayDateStr,
  isVaultConfigured,
  readVaultFile,
} from "@/lib/github-vault";
import type { DashboardData } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dailyPath = `daily/${getTodayDateStr()}.md`;
  const [cordRes, dailyNote, wikiIndex, homeNote] = await Promise.all([
    fetchCordData(),
    readVaultFile(dailyPath),
    readVaultFile("wiki/index.md"),
    readVaultFile("Home.md"),
  ]);

  const vaultConnected = isVaultConfigured();

  const payload: DashboardData = {
    syncedAt: new Date().toISOString(),
    mode: cordRes.live || vaultConnected ? "live" : "demo",
    vaultConnected,
    cordConnected: cordRes.live,
    tasks: cordRes.data.tasks,
    waitingTasks: cordRes.data.waitingTasks,
    events: cordRes.data.events,
    gmail: cordRes.data.gmail,
    meals: cordRes.data.meals,
    weather: cordRes.data.weather,
    vault: {
      dailyPath,
      dailyNote:
        dailyNote ||
        (!vaultConnected
          ? {
              path: dailyPath,
              title: getTodayDateStr(),
              content:
                "# Daily Log Preview\n\nConnect `GITHUB_TOKEN` in `.env.local` to stream your live Obsidian `daily/`, `Home.md`, and `wiki/index.md` notes two-way.",
            }
          : null),
      wikiIndex:
        wikiIndex ||
        (!vaultConnected
          ? {
              path: "wiki/index.md",
              title: "Wiki Index",
              content:
                "## AI Knowledge Architectures\n- [[LLM Wiki]]\n- [[Home Repo Pattern]]\n- [[Obsidian Life OS]]\n- [[Dashboard pro]]\n- [[UI Inspiration]]",
            }
          : null),
      homeNote,
    },
  };

  return NextResponse.json(payload);
}
