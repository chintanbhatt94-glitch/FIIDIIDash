// app/api/fii-dii/route.ts
// GET /api/fii-dii  -> returns FII/DII activity from NSE public endpoint
//
// NSE's public endpoint requires a "warm" session (cookies from the main site)
// before it will return JSON. We do a two-step fetch.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0; // never cache; fetch fresh each request

// We cache in-memory across requests for 5 minutes to avoid hammering NSE
let cache: { data: any; ts: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

const NSE_HOME = "https://www.nseindia.com";
const NSE_FIIDII = "https://www.nseindia.com/api/fiidiiTradeReact";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/reports/fii-dii",
};

async function fetchNSE() {
  // Step 1: warm-up to get cookies
  const home = await fetch(NSE_HOME, { headers: HEADERS, cache: "no-store" });
  const cookies = home.headers.get("set-cookie") || "";

  // Step 2: actual API call with cookies
  const res = await fetch(NSE_FIIDII, {
    headers: { ...HEADERS, Cookie: cookies },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`NSE returned ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    // Serve cache if fresh
    if (cache && Date.now() - cache.ts < CACHE_MS) {
      return NextResponse.json({ source: "cache", ...cache.data });
    }

    const raw = await fetchNSE();

    // NSE returns an array of {category, buyValue, sellValue, netValue, date}
    // We split it into FII/DII rows
    const fii = raw.find((r: any) =>
      String(r.category).toUpperCase().includes("FII") ||
      String(r.category).toUpperCase().includes("FPI")
    );
    const dii = raw.find((r: any) =>
      String(r.category).toUpperCase().includes("DII")
    );

    const payload = {
      date: fii?.date || dii?.date || new Date().toISOString().split("T")[0],
      fii: fii
        ? {
            buy: Number(fii.buyValue),
            sell: Number(fii.sellValue),
            net: Number(fii.netValue),
          }
        : null,
      dii: dii
        ? {
            buy: Number(dii.buyValue),
            sell: Number(dii.sellValue),
            net: Number(dii.netValue),
          }
        : null,
      raw,
    };

    cache = { data: payload, ts: Date.now() };
    return NextResponse.json({ source: "live", ...payload });
  } catch (err: any) {
    // If NSE fails (common — they aggressively rate-limit), return stale cache or error
    if (cache) {
      return NextResponse.json({
        source: "stale-cache",
        warning: "NSE fetch failed; returning cached data",
        error: err?.message,
        ...cache.data,
      });
    }
    return NextResponse.json(
      {
        error: "Failed to fetch FII/DII data",
        details: err?.message,
        hint: "NSE public endpoint sometimes blocks server IPs. Consider using a paid source like Moneycontrol/Trendlyne if this persists in production.",
      },
      { status: 502 }
    );
  }
}
