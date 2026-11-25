export type ActionType =
  | "TASK"
  | "EMAIL_DRAFT"
  | "EVENT"
  | "IDEA_NOTE"
  | "MEAL_PLAN";

export interface TaskItem {
  id: string;
  title: string;
  estimatedMinutes: number;
  notes?: string;
  due?: string;
  priority: number;
  waiting?: boolean;
  source?: "google" | "obsidian";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export interface GmailItem {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  kind: "draft" | "triaged";
}

export interface DayMeals {
  dayLabel: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface TidePoint {
  time: string;
  height: number;
  type?: "high" | "low";
}

export interface WeatherTides {
  location: string;
  tempC: number;
  windKts: number;
  seaTempC: number;
  waveHeightM: number;
  tideState: "Rising" | "Falling";
  points: TidePoint[];
  hourly?: Array<{ hour: number; height: number }>;
}

export interface VaultNotePreview {
  path: string;
  title: string;
  content: string;
  sha?: string;
  updatedAt?: string;
}

export interface DashboardData {
  syncedAt: string;
  mode: "live" | "demo";
  vaultConnected: boolean;
  cordConnected: boolean;
  tasks: TaskItem[];
  waitingTasks: TaskItem[];
  events: CalendarEvent[];
  gmail: GmailItem[];
  meals: {
    today: DayMeals;
    tomorrow: DayMeals;
  };
  weather: WeatherTides;
  vault: {
    dailyPath: string;
    dailyNote: VaultNotePreview | null;
    wikiIndex: VaultNotePreview | null;
    homeNote: VaultNotePreview | null;
  };
}

export interface ClassifiedItem {
  actionType: ActionType;
  title: string;
  details: string;
  estimatedMinutes?: number;
  dueDateIso?: string;
  endTimeIso?: string;
  recipientEmail?: string;
  tags?: string[];
  folder?: string;
  mealDay?: "today" | "tomorrow";
  mealSlot?: "breakfast" | "lunch" | "dinner";
}

export interface CaptureRouteResult {
  actionType: ActionType;
  title: string;
  destinations: string[];
  status: "ok" | "partial" | "demo";
  message: string;
}
