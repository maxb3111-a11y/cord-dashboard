import type {
  CalendarEvent,
  DayMeals,
  GmailItem,
  TaskItem,
  WeatherTides,
} from "./types";

export function isCordConfigured(): boolean {
  return Boolean(process.env.CORD_APPS_SCRIPT_URL?.trim());
}

export interface CordPayload {
  tasks: TaskItem[];
  waitingTasks: TaskItem[];
  events: CalendarEvent[];
  gmail: GmailItem[];
  meals: { today: DayMeals; tomorrow: DayMeals };
  weather: WeatherTides;
}

export async function fetchCordData(): Promise<{
  live: boolean;
  data: CordPayload;
}> {
  const url = process.env.CORD_APPS_SCRIPT_URL?.trim();
  const secret = process.env.CORD_API_SECRET?.trim() || "";

  if (url) {
    try {
      const target = `${url}${url.includes("?") ? "&" : "?"}action=dashboard&secret=${encodeURIComponent(secret)}`;
      const res = await fetch(target, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok && json.data) {
          return { live: true, data: json.data as CordPayload };
        }
      }
    } catch {
      // Fall back to demo preview data if Apps Script bridge isn't deployed yet
    }
  }

  return { live: false, data: getDemoCordData() };
}

export async function postCordAction(
  action: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; demo?: boolean; error?: string }> {
  const url = process.env.CORD_APPS_SCRIPT_URL?.trim();
  const secret = process.env.CORD_API_SECRET?.trim() || "";
  if (!url) {
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, secret, ...payload }),
    });
    if (!res.ok) {
      return { ok: false, error: `Apps Script HTTP ${res.status}` };
    }
    const json = await res.json();
    return { ok: Boolean(json?.ok), error: json?.error };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export function getDemoCordData(): CordPayload {
  return {
    tasks: [
      {
        id: "t-1",
        title: "Check snow equipment",
        estimatedMinutes: 20,
        priority: 1,
        source: "google",
      },
      {
        id: "t-2",
        title: "Confirm Moneybox account details",
        estimatedMinutes: 5,
        priority: 2,
        source: "google",
      },
      {
        id: "t-3",
        title: "Renew postal vote",
        estimatedMinutes: 5,
        priority: 3,
        source: "google",
      },
      {
        id: "t-4",
        title: "Review London Gatwick AutoPay notice",
        estimatedMinutes: 5,
        priority: 4,
        source: "google",
      },
      {
        id: "t-5",
        title: "Review updated Tour Guide Visa process guidance",
        estimatedMinutes: 5,
        priority: 5,
        source: "google",
      },
    ],
    waitingTasks: [
      {
        id: "w-1",
        title: "@waiting Reply from Brighton Marina on winter berth",
        estimatedMinutes: 5,
        priority: 1,
        waiting: true,
        source: "google",
      },
    ],
    events: [
      {
        id: "e-1",
        title: "Weekly Obsidian /health-check review",
        start: "19:00",
        end: "19:30",
        location: "Home Repo",
      },
    ],
    gmail: [
      {
        id: "g-1",
        subject: "Re: Winter Ski Equipment Checklist",
        from: "Draft (AI Generated)",
        snippet: "Hi — confirming boots, bindings, and helmet are packed...",
        date: "Draft",
        kind: "draft",
      },
      {
        id: "g-2",
        subject: "London Gatwick AutoPay — Account Security Notice",
        from: "Gatwick Airport",
        snippet: "Action required: review your linked payment method...",
        date: "Today",
        kind: "triaged",
      },
    ],
    meals: {
      today: {
        dayLabel: "Today",
        breakfast: "Overnight oats & berries",
        lunch: "Chicken & avocado wraps",
        dinner: "Cottage pie",
      },
      tomorrow: {
        dayLabel: "Tomorrow",
        breakfast: "Eggs on sourdough",
        lunch: "Not planned",
        dinner: "Salmon, greens & rice",
      },
    },
    weather: {
      location: "Brighton & Hove",
      tempC: 8,
      windKts: 9,
      seaTempC: 11.8,
      waveHeightM: 1.1,
      tideState: "Falling",
      points: [
        { time: "04:00", height: 0.9, type: "low" },
        { time: "10:00", height: 6.2, type: "high" },
        { time: "16:00", height: 0.6, type: "low" },
        { time: "22:00", height: 6.0, type: "high" },
      ],
    },
  };
}
