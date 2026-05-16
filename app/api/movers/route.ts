// app/api/movers/route.ts
// Computes top gainers, losers, and most active from a large-cap universe.
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { NIFTY_LARGE_CAPS } from "@/data/watchlist";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Cache for 60s — heavier endpoint
let cache: { data: any; ts: number } | null = null;
const CACHE_MS = 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_MS) {
      return NextResponse.json({ source: "cache", ...cache.data });
    }

    yahooFinance.suppressNotices(["yahooSurvey"]);
    const results = await yahooFinance.quote(NIFTY_LARGE_CAPS);
    const arr = Array.isArray(results) ? results : [results];

    const enriched = arr
      .filter((q: any) => q.regularMarketPrice && q.regularMarketChangePercent !== undefined)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        volume: q.regularMarketVolume,
        value: (q.regularMarketPrice || 0) * (q.regularMarketVolume || 0),
      }));

    const gainers = [...enriched]
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .slice(0, 10);
    const losers = [...enriched]
      .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
      .slice(0, 10);
    const active = [...enriched]
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 10);

    const payload = { gainers, losers, active, timestamp: new Date().toISOString() };
    cache = { data: payload, ts: Date.now() };
    return NextResponse.json({ source: "live", ...payload });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
