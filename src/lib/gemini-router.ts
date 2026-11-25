import type { ClassifiedItem } from "./types";

export async function classifyCaptureWithGemini(params: {
  text: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<ClassifiedItem[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const text = params.text.trim();

  if (!apiKey) {
    return fallbackClassify(text);
  }

  const nowIso = new Date().toISOString();
  const prompt = `You are Max's C.O.R.D. Second Brain router (Brighton & Hove, UK; UK English).
Current UTC time: ${nowIso}.
Classify the user's input (and optional screenshot/image) into 1 or more discrete JSON items.

Return ONLY valid JSON with shape:
{
  "items": [
    {
      "actionType": "TASK" | "EMAIL_DRAFT" | "EVENT" | "IDEA_NOTE" | "MEAL_PLAN",
      "title": "Short clean title (fix spelling/grammar)",
      "details": "Structured notes, email body, or event description",
      "estimatedMinutes": 5,
      "dueDateIso": "YYYY-MM-DDTHH:mm:ssZ (optional)",
      "endTimeIso": "YYYY-MM-DDTHH:mm:ssZ (optional)",
      "recipientEmail": "optional email address",
      "tags": ["optional", "tags"],
      "folder": "raw-sources/cord-captures",
      "mealDay": "today" | "tomorrow",
      "mealSlot": "breakfast" | "lunch" | "dinner"
    }
  ]
}

Rules:
- TASK: Actionable to-do items. Start with a strong verb.
- EMAIL_DRAFT: Any email to write or reply to. Draft a crisp, natural body in details.
- EVENT: Meetings, appointments, or time-bound plans.
- IDEA_NOTE: Reference links, ideas, research notes, or anything to store in Obsidian.
- MEAL_PLAN: Food planned for breakfast, lunch, or dinner.

User input:
${text || "Analyze the attached screenshot and extract all tasks, events, email drafts, or notes."}`;

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (params.imageBase64 && params.imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: params.imageMimeType,
        data: params.imageBase64.replace(/^data:[^;]+;base64,/, ""),
      },
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    return fallbackClassify(text);
  }

  const json = await res.json();
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return fallbackClassify(text);

  try {
    const parsed = JSON.parse(raw) as { items?: ClassifiedItem[] };
    if (Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed.items;
    }
  } catch {
    // Fall through to heuristic fallback
  }

  return fallbackClassify(text);
}

function fallbackClassify(text: string): ClassifiedItem[] {
  const lower = text.toLowerCase();
  if (/^(email|draft|reply|send email)/i.test(lower)) {
    return [
      {
        actionType: "EMAIL_DRAFT",
        title: text.replace(/^(email|draft|reply)\s*:?\s*/i, "").slice(0, 80) || "New Email Draft",
        details: text,
      },
    ];
  }
  if (/\b(breakfast|lunch|dinner)\b/i.test(lower)) {
    const slot = lower.includes("breakfast")
      ? "breakfast"
      : lower.includes("lunch")
        ? "lunch"
        : "dinner";
    return [
      {
        actionType: "MEAL_PLAN",
        title: text,
        details: text,
        mealDay: lower.includes("tomorrow") ? "tomorrow" : "today",
        mealSlot: slot,
      },
    ];
  }
  if (/\b(meeting|appointment|call at|tomorrow at|\d{1,2}:\d{2})\b/i.test(lower)) {
    return [
      {
        actionType: "EVENT",
        title: text.slice(0, 80),
        details: text,
      },
    ];
  }
  if (/^(note|idea|ref|reference|http)/i.test(lower)) {
    return [
      {
        actionType: "IDEA_NOTE",
        title: text.replace(/^(note|idea|ref|reference)\s*:?\s*/i, "").slice(0, 80) || "Quick Note",
        details: text,
        tags: ["cord-capture"],
        folder: "raw-sources/cord-captures",
      },
    ];
  }
  return [
    {
      actionType: "TASK",
      title: text.slice(0, 100) || "Captured Task",
      details: text,
      estimatedMinutes: 10,
    },
  ];
}
