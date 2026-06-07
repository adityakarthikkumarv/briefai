# BriefAI — AI-Powered Pre-Meeting Sales Intelligence

> **"Walk into every meeting knowing everything."**

A working AI demo built for the BITSoM × Masai School capstone (Problem Statement 4).  
Enter a company name → Claude AI researches it from live news → Get a 1-page meeting brief in seconds.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/adityakarthikkumarv/briefai-demo&env=ANTHROPIC_API_KEY,NEWS_API_KEY)

---

## 🚀 Deploy in 5 Minutes

### Step 1 — Get your API keys (both free)

**Anthropic API Key** (Required)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up → Click "API Keys" → "Create Key"
3. Copy the key (starts with `sk-ant-...`)

**NewsAPI Key** (Optional but recommended)
1. Go to [newsapi.org/register](https://newsapi.org/register)
2. Sign up free → Your API key is shown on the dashboard
3. Copy the key

### Step 2 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Import **this repository** (`briefai-demo`)
4. In the **"Environment Variables"** section, add:
   - `ANTHROPIC_API_KEY` → paste your Anthropic key
   - `NEWS_API_KEY` → paste your NewsAPI key
5. Click **"Deploy"**
6. Wait ~60 seconds → Your live URL appears! 🎉

### Step 3 — Record your demo video

1. Open your live Vercel URL
2. Open [Loom](https://loom.com) → Start recording
3. Type "Anthropic" in the company field → Click Generate
4. Show the brief that appears
5. Done! Share the Loom link in your Phase 5 PDF

---

## 🏗️ How It Works

```
User types company name
        ↓
/api/generate-brief (Vercel Serverless Function)
        ↓
NewsAPI → fetches last 30 days of real news about the company
        ↓
Anthropic Claude claude-sonnet-4-20250514 → reads news + writes 1-page brief
        ↓
React frontend displays: Overview · News · Financial · Sentiment · Talking Points
```

---

## 💻 Run Locally

```bash
git clone https://github.com/adityakarthikkumarv/briefai-demo.git
cd briefai-demo
npm install

# Create .env.local and add your keys
cp .env.example .env.local
# Edit .env.local and add ANTHROPIC_API_KEY and NEWS_API_KEY

npm run dev
# Open http://localhost:5173
```

---

## 📁 Project Structure

```
briefai-demo/
├── api/
│   └── generate-brief.js    ← Serverless function (NewsAPI + Claude)
├── src/
│   ├── App.jsx               ← Main app with 3 states: home/loading/result
│   ├── components/
│   │   ├── BriefGenerator.jsx  ← Input form (home page)
│   │   ├── LoadingState.jsx    ← Animated loading with step indicators
│   │   └── BriefDisplay.jsx    ← Full brief with 5 tabs
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| AI Engine | Anthropic Claude claude-sonnet-4-20250514 |
| News Data | NewsAPI.org (last 30 days) |
| Hosting | Vercel (serverless) |

---

## 👥 Team

Aditya Karthik Kumar Vummadisingu · Harshita Pendyala · Diksha Ahuja  
Karan Kumar · Ishita Seth · Shruti Dudhe

**BITSoM × Masai School | Product Management with Generative & Agentic AI | Batch 2 | Problem Statement 4**
