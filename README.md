# C.O.R.D. Second Brain — Web Dashboard

Responsive Obsidianite-styled Bento dashboard uniting **Google Workspace** (Tasks, Gmail, Calendar, Brighton Tides/Meals), **Gemini Vision/Text Auto-Routing**, and **Two-Way Obsidian Vault Sync** via GitHub (`maxb3111-a11y/home`).

## 1. Local Setup (Windows)

Install Node.js LTS (if not installed yet):
```powershell
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

Then open a new PowerShell window:
```powershell
cd "c:\Users\Max\Downloads\Dashboard pro\gem\cord-dashboard"
copy .env.example .env.local
npm install
npm run dev
```
Open `http://localhost:3000`.

## 2. Configure `.env.local`

- `GEMINI_API_KEY`: Your Google AI Studio key (for Universal Quick Capture classification + screenshot OCR).
- `GITHUB_TOKEN`: Your Fine-Grained GitHub PAT (`home` repo → Contents: Read & Write) for live two-way Obsidian sync.
- `CORD_APPS_SCRIPT_URL` & `CORD_API_SECRET`: Paste `apps-script-bridge/CORD_JSON_API_Bridge.gs` into your C.O.R.D. Apps Script project, set Script Property `CORD_API_SECRET`, redeploy, and paste the Web App URL here.
- `CORD_DASHBOARD_PASSCODE`: Set a passcode before deploying to Vercel so only you can access it from PC or phone.

## 3. Deploy to Vercel (PC + Phone Access)

1. Push `cord-dashboard/` to a private GitHub repo.
2. Import the repo at [vercel.com/new](https://vercel.com/new), paste the same environment variables from `.env.local`, and click **Deploy**.
