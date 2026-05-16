# India Markets Terminal — v2

Institutional-grade live dashboard for Indian capital markets with FII/DII intelligence, sector heatmaps, options positioning, sentiment scoring, and AI-generated market commentary.

---

## What's new in v2

| Feature | Status |
|---|---|
| Today's FII/DII headline tiles (Cash + 3 F&O categories) | ✅ |
| Historical FII/DII chart (30/60/90 days) | ✅ |
| FII vs Nifty correlation chart (twin-axis) | ✅ |
| Sector strength heatmap (FII flow proxy) | ✅ |
| Market sentiment dial with reasoning | ✅ |
| Watchlist (custom tickers) | ✅ |
| High-FII-holding stocks panel | ✅ |
| Top gainers / losers / most active | ✅ |
| Option chain PCR + Max Pain (Nifty & Bank Nifty) | ✅ |
| Live USD/INR, US 10Y, Brent, Gold, VIX | ✅ |
| Historical price chart (5D to 5Y) | ✅ |
| AI-written market commentary | ✅ (requires Anthropic API key) |
| Terms-of-use modal + SEBI disclaimers | ✅ |

---

## How to deploy (you already have Vercel set up)

Since your existing repo `FIIDIIDash` is already connected to Vercel, you just need to **replace the old files with v2 files**, and Vercel will redeploy automatically.

### Step 1: Replace files on GitHub

1. Go to **github.com/chintanbhatt94-glitch/FIIDIIDash**
2. Delete the old files individually, OR clear the repo and re-upload (recommended below)

**Easiest path — fresh upload:**

1. In your repo, click the `…` menu near each old file and delete it (or use Settings → Delete this repository → Create new, but that breaks the Vercel link)
2. A cleaner approach: just **drag and drop the v2 files on top**. GitHub will ask "replace existing files?" → click yes.
3. Commit with message `v2 upgrade`

### Step 2: Vercel auto-deploys

Vercel watches for commits. Within 90 seconds of your commit, a new deployment starts. Wait for the green ✅.

### Step 3: Set environment variables (one-time)

Some features need configuration. In Vercel:

1. Go to **vercel.com** → your project → **Settings** → **Environment Variables**
2. Add each of these (only `ANTHROPIC_API_KEY` is needed for AI commentary; the password is optional):

| Name | Value | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | (your key) | Enables AI commentary panel |
| `DASHBOARD_PASSWORD` | (optional) | (Reserved for future auth feature) |

3. After adding, click **Save**, then go to **Deployments** tab → click `…` on the latest deployment → **Redeploy**

---

## Getting an Anthropic API key (for AI commentary)

1. Go to **console.anthropic.com**
2. Sign up / log in
3. Click **API Keys** in the left sidebar
4. Click **Create Key**, name it `markets-dashboard`
5. **Copy the key immediately** (it's only shown once)
6. Paste it into Vercel → Settings → Environment Variables → `ANTHROPIC_API_KEY`
7. Redeploy

Cost: Each commentary generation uses ~1,000-2,000 tokens. At Sonnet 4.6 pricing ($3/$15 per million tokens), one commentary = ~$0.01 (₹0.85). The cache holds for 30 minutes, so even with constant viewers you'd spend ~₹50/day max.

---

## Customizing your watchlist

Edit `data/watchlist.ts` directly on GitHub:

```ts
export const WATCHLIST = [
  { symbol: "RELIANCE.NS", label: "Reliance" },
  { symbol: "TCS.NS", label: "TCS" },
  // Add yours here — use NSE symbol + ".NS" suffix
  { symbol: "INFY.NS", label: "Infosys" },
];
```

For Yahoo Finance, NSE symbols always need `.NS` appended. BSE-only listings use `.BO`. Examples:

| Stock | Symbol |
|---|---|
| Reliance Industries | `RELIANCE.NS` |
| HDFC Bank | `HDFCBANK.NS` |
| TCS | `TCS.NS` |
| Asian Paints | `ASIANPAINT.NS` |
| Larsen & Toubro | `LT.NS` |
| Bajaj Finance | `BAJFINANCE.NS` |

Save the file → commit → Vercel auto-redeploys within 90 seconds.

---

## SEBI Compliance Notes

This dashboard is designed for **public-facing use** with the following safeguards built in:

1. **Terms-of-use modal** shown on first visit (stored in browser localStorage)
2. **Persistent footer disclaimer** on every page
3. **AI commentary prompt** explicitly forbids buy/sell/recommend/target language
4. **Sentiment scoring** is broad-market only (Nifty), never applied to individual stocks
5. **No individual stock recommendations** anywhere in the dashboard

If you intend to monetize this or share it commercially with non-institutional clients, consult a SEBI-compliance lawyer. The disclaimers reduce but do not eliminate exposure under SEBI Research Analyst / Investment Adviser regulations.

---

## Data sources (all free)

| Data | Source | Refresh |
|---|---|---|
| Indices, sector indices, stocks live + historical | Yahoo Finance | 30s / 60s |
| USD/INR, US yields, global macro | Yahoo Finance | 30s |
| FII/DII cash + F&O | NSE official API | 5 min |
| FII/DII historical | Moneycontrol public API (fallback) | 1 hour |
| Option chain + PCR + Max Pain | NSE official API | 2 min |
| Sector heatmap | Yahoo Finance (sector indices) | 60s |
| AI commentary | Anthropic Claude Sonnet 4.6 | 30 min |

---

## Known limitations

**1. Yahoo Finance is delayed by ~15 minutes** on Indian indices. For real-time tick data, you'd need a paid broker API (Kite Connect, ICICI Breeze, TrueData) — costs ₹500-2000/month plus SEBI account requirements.

**2. NSE may rate-limit Vercel's server IPs** during high traffic. The dashboard handles this with caching + graceful fallback messages. If FII/DII or option chain shows "unavailable" persistently, the workaround is a daily cron job that fetches from a residential IP and commits a JSON snapshot to the repo — instructions below.

**3. FII/DII history requires Moneycontrol's public endpoint.** If it changes their format or rate-limits, the chart will show a friendly fallback message. For permanent reliability, set up the daily snapshot cron.

**4. Sector-wise FII flows are inferred, not actual.** True daily sector flows are a paid product (Trendlyne, Moneycontrol Pro). The sector heatmap shows price strength as a proxy — interpret alongside the FII cash direction tile.

**5. FII shareholding data is from last quarterly filing.** Refresh `data/watchlist.ts > FII_FAVORITES` quarterly from BSE shareholding disclosures.

---

## Optional: Daily FII/DII snapshot cron (for permanent history)

If you want bulletproof historical FII/DII data instead of relying on Moneycontrol's public endpoint:

1. Add a Vercel Cron Job in `vercel.json` that hits `/api/fii-dii` at 6 PM IST daily
2. Persist the response to a JSON file in the repo OR a free database like Vercel KV / Upstash Redis
3. Modify `/api/fii-dii-history` to read from your persisted store instead of Moneycontrol

Setup time: ~2 hours. Tell me if you want me to add this and I'll write the cron + storage layer.

---

## File structure

```
markets-dashboard/
├── package.json
├── next.config.js              # Has the yahoo-finance2 webpack fix
├── tsconfig.json
├── .env.example                # Copy values to Vercel env vars
├── .gitignore
├── README.md                   # This file
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Main dashboard
│   ├── globals.css             # Styles
│   └── api/                    # 11 API endpoints
│       ├── quote/route.ts
│       ├── historical/route.ts
│       ├── fii-dii/route.ts
│       ├── fii-dii-history/route.ts
│       ├── option-chain/route.ts
│       ├── global/route.ts
│       ├── watchlist/route.ts
│       ├── movers/route.ts
│       ├── sector-proxy/route.ts
│       ├── sentiment/route.ts
│       └── commentary/route.ts
├── components/                 # 11 React components
│   ├── QuoteTile.tsx
│   ├── HistoricalChart.tsx
│   ├── FiiDiiHeadline.tsx
│   ├── FiiDiiHistoryChart.tsx
│   ├── FiiNiftyCorrelation.tsx
│   ├── SectorHeatmap.tsx
│   ├── SentimentDial.tsx
│   ├── StockTable.tsx
│   ├── OptionChainPanel.tsx
│   ├── AICommentary.tsx
│   └── TermsModal.tsx
├── data/
│   └── watchlist.ts            # YOUR WATCHLIST GOES HERE
└── lib/
    ├── symbols.ts
    └── nse.ts                  # Shared NSE fetcher with retry
```

---

*Insights are analytical in nature and not investment advice. The publisher is not a SEBI-registered Investment Adviser or Research Analyst.*
