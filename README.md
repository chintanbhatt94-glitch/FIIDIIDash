# India Markets Terminal

An institutional-grade live dashboard for Indian capital markets — Nifty, Bank Nifty, sector indices, FII/DII flows, option chain PCR, India VIX, USD/INR, US yields, and global macro.

Live data refreshes every 30 seconds (quotes), 60 seconds (charts), 2 minutes (option chain), and 5 minutes (FII/DII flows). Historical data lookback ranges from 5 days to 5 years.

---

## What you're getting

**Data sources (all free, no API key needed):**

| Data | Source | Refresh |
|---|---|---|
| Nifty / Bank Nifty / Sensex live + historical | Yahoo Finance (`yahoo-finance2`) | 30s / 60s |
| India VIX | Yahoo Finance (`^INDIAVIX`) | 30s |
| Sector indices (IT, Auto, FMCG, Pharma, Metal, Energy, Realty, PSU Bank) | Yahoo Finance | 30s |
| USD/INR | Yahoo Finance (`INR=X`) | 30s |
| US 10Y yield, S&P 500, VIX, DXY, Brent, Gold, Hang Seng | Yahoo Finance | 30s |
| FII/DII cash market flows | NSE official `fiidiiTradeReact` endpoint | 5 min |
| Option chain + PCR + Max Pain (Nifty & Bank Nifty) | NSE official `option-chain-indices` endpoint | 2 min |

---

## Step-by-step deployment to Vercel (10 minutes, zero cost)

### Prerequisites

You need **three free accounts**:

1. **GitHub** — to host the code → https://github.com/signup
2. **Vercel** — to host the live site → https://vercel.com/signup (sign in with your GitHub account; easier)
3. **Node.js** on your computer — only if you want to test locally first → https://nodejs.org (download the LTS version, click through the installer)

### Step 1: Create the GitHub repo

1. Log in to GitHub and click the **+** icon (top right) → **New repository**.
2. Repository name: `markets-dashboard`
3. Set it to **Private** (your dashboard, your data).
4. Click **Create repository**.

### Step 2: Upload these files to GitHub

You have two options.

**Option A — Drag and drop (easiest):**

1. On the new empty repo page, click the link that says **"uploading an existing file"**.
2. Drag the entire `markets-dashboard` folder contents (every file and folder) into the upload area.
3. Scroll down, write a commit message like `initial commit`, click **Commit changes**.

**Option B — Git command line:**

```bash
cd markets-dashboard
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/markets-dashboard.git
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to https://vercel.com/new
2. Click **Import** next to your `markets-dashboard` repository (if you don't see it, click "Adjust GitHub App Permissions" and grant Vercel access to that repo).
3. Leave every setting at the default — Vercel auto-detects Next.js.
4. Click **Deploy**.
5. Wait ~90 seconds. Vercel will give you a URL like `markets-dashboard-abc123.vercel.app`.

That's it. Open the URL on your phone or laptop — it's live.

### Step 4 (optional): Custom domain

In the Vercel project → **Settings** → **Domains** → add your own domain (e.g. `markets.yourdomain.com`). Vercel walks you through the DNS records.

---

## Run locally first (optional)

If you want to test on your laptop before deploying:

```bash
cd markets-dashboard
npm install
npm run dev
```

Open http://localhost:3000

---

## Files in this project

```
markets-dashboard/
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.js            # Next.js config
├── app/
│   ├── layout.tsx            # Root HTML wrapper
│   ├── page.tsx              # The dashboard page itself
│   ├── globals.css           # All styling
│   └── api/
│       ├── quote/route.ts          # Live quote endpoint
│       ├── historical/route.ts     # Historical OHLC endpoint
│       ├── fii-dii/route.ts        # FII/DII flow endpoint (NSE)
│       ├── option-chain/route.ts   # Option chain + PCR (NSE)
│       └── global/route.ts         # Batch global quotes
├── components/
│   ├── QuoteTile.tsx         # Individual price tile
│   ├── HistoricalChart.tsx   # Chart with range selector
│   ├── FiiDiiPanel.tsx       # FII/DII panel
│   └── OptionChainPanel.tsx  # PCR + Max Pain panel
└── lib/
    └── symbols.ts            # Yahoo Finance ticker mapping
```

---

## Known caveats (read these)

### 1. Yahoo Finance has a ~15 minute delay on Indian indices
This is normal for free data. For true real-time, you'd need a paid feed (TrueData, Kite Connect, ICICI Breeze) and a SEBI license check. The dashboard shows a "MARKET OPEN/CLOSED" indicator so you always know whether you're looking at live-but-delayed or end-of-day data.

### 2. NSE blocks server IPs sometimes
The FII/DII and option-chain endpoints scrape `nseindia.com` directly. NSE's WAF (web firewall) occasionally rate-limits cloud server IPs (Vercel, AWS, etc.) for short windows. The dashboard handles this gracefully — it shows cached data with a warning and retries automatically. If you see "offline" persistently, the alternatives are:

- Set up a separate cron job that fetches FII/DII once a day at 6 PM IST from your own home internet, dumps it into a JSON file in the repo, and the dashboard reads from there.
- Subscribe to a paid wrapper service (Moneycontrol, Trendlyne, Sensibull all offer this).

### 3. Option chain endpoint sometimes returns empty
NSE serves the option chain reliably during market hours (9:15 AM – 3:30 PM IST) and for ~30 min after close. Outside that window the response may be sparse.

### 4. Make this production-grade with a paid feed
The architecture is plug-and-play: each `app/api/*/route.ts` file is an isolated endpoint. To switch to a paid source (e.g. Kite Connect or TrueData), you only edit the route file — the React components stay the same.

---

## Customizing

- **Add a new index/ticker**: open `lib/symbols.ts`, add the Yahoo Finance ticker, then drop a `<QuoteTile>` into `app/page.tsx`.
- **Change refresh rates**: edit the `refreshInterval` value (milliseconds) in each component.
- **Change colors / fonts**: edit the CSS variables at the top of `app/globals.css`.

---

## Cost

Vercel free tier covers this entirely up to ~100 GB bandwidth/month — enough for hundreds of personal users. You only pay if you hit very heavy traffic.

---

*Insights are analytical in nature and not guaranteed investment advice.*
