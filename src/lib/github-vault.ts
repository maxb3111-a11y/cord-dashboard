import type { VaultNotePreview } from "./types";

const OWNER = process.env.GITHUB_REPO_OWNER || "maxb3111-a11y";
const REPO = process.env.GITHUB_REPO_NAME || "home";
const BRANCH = process.env.GITHUB_REPO_BRANCH || "main";

export function isVaultConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export async function readVaultFile(
  path: string
): Promise<VaultNotePreview | null> {
  if (!isVaultConfigured()) return null;
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodePath(
    path
  )}?ref=${encodeURIComponent(BRANCH)}`;

  const res = await fetch(url, {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    content?: string;
    sha?: string;
    name?: string;
  };
  if (!json.content) return null;

  const decoded = Buffer.from(
    json.content.replace(/\n/g, ""),
    "base64"
  ).toString("utf8");

  return {
    path,
    title: (json.name || path).replace(/\.md$/i, ""),
    content: decoded,
    sha: json.sha,
  };
}

export async function writeVaultFile(
  path: string,
  content: string,
  commitMessage: string
): Promise<{ ok: boolean; path: string; error?: string }> {
  if (!isVaultConfigured()) {
    return { ok: false, path, error: "GITHUB_TOKEN not configured" };
  }

  const existing = await readVaultFile(path);
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodePath(
    path
  )}`;

  const body: Record<string, string> = {
    message: commitMessage,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (existing?.sha) {
    body.sha = existing.sha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, path, error: `GitHub ${res.status}: ${errText}` };
  }
  return { ok: true, path };
}

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildNewDailyNote(dateStr: string): string {
  return `---
title: "${dateStr}"
tags:
  - daily
created: "${dateStr}"
effort_focus:
effort_create:
effort_health:
effort_relationships:
---

# ${dateStr}

> [!tip] Quick Links
> [[Home]] · [[wiki/index|Wiki Index]] · [[wiki/log|Wiki Log]] · [[Dashboard pro]]

## Top 3 Intentions
- [ ] 

## Events & Schedule

## Vault / Project Tasks Captured Today

## Wins & Notes
`;
}

export async function appendToDailyNote(
  sectionHeading: string,
  bulletLine: string
): Promise<{ ok: boolean; path: string; error?: string }> {
  const dateStr = getTodayDateStr();
  const path = `daily/${dateStr}.md`;
  const existing = await readVaultFile(path);
  let content = existing?.content || buildNewDailyNote(dateStr);

  const headingRegex = new RegExp(`(^##\\s+${sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*$)`, "m");
  if (headingRegex.test(content)) {
    content = content.replace(headingRegex, `$1\n${bulletLine}`);
  } else {
    content = `${content.trimEnd()}\n\n## ${sectionHeading}\n${bulletLine}\n`;
  }

  return writeVaultFile(
    path,
    content,
    `C.O.R.D. dashboard: log entry to ${path}`
  );
}

export async function createCaptureNote(params: {
  title: string;
  details: string;
  tags?: string[];
  rawText?: string;
  folder?: string;
}): Promise<{ ok: boolean; path: string; error?: string }> {
  const dateStr = getTodayDateStr();
  const timeStamp = new Date().toISOString().slice(11, 19).replace(/:/g, "");
  const slug = params.title
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60) || "Captured Note";

  const folder = params.folder?.trim() || "raw-sources/cord-captures";
  const path = `${folder.replace(/\/+$/, "")}/${dateStr}_${timeStamp} ${slug}.md`;
  const tagList =
    params.tags && params.tags.length > 0 ? params.tags : ["cord-capture"];

  const md = [
    "---",
    `title: "${params.title.replace(/"/g, '\\"')}"`,
    `captured: "${dateStr}"`,
    `source: "C.O.R.D. Web Dashboard"`,
    "tags:",
    ...tagList.map((t) => `  - ${t.replace(/^#/, "")}`),
    "---",
    "",
    `# ${params.title}`,
    "",
    params.details.trim(),
    ...(params.rawText
      ? ["", "## Original Capture", "", params.rawText.trim()]
      : []),
    "",
  ].join("\n");

  return writeVaultFile(path, md, `C.O.R.D. dashboard: capture "${params.title}"`);
}
