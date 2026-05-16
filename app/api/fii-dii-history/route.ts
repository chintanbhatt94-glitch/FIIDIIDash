// app/api/fii-dii-history/route.ts
// Returns historical FII/DII flow data for chart visualization.
//
// Strategy: NSE only exposes "latest" via the public API. For history,
// we reconstruct it from Moneycontrol's open data endpoint, which is
// the standard public source. If that fails, we fall back to a synthetic
// 30-day window built from the daily-snapshot accumulator.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: { data: any; ts: number } | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 hour — daily data doesn't change intraday

const MC_URL = "https://api.moneycontrol.com/mcapi/v1/fno/getInstHistoricalData";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Accept": "application/json",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  try {
    if (cache && Date.now() - cache.ts < CACHE_MS) {
      return NextResponse.json({ source: "cache", days, ...cache.data });
    }

    // Try Moneycontrol first
    const params = new URLSearchParams({
      type: "1",        // 1 = FII/DII
      duration: String(Math.min(days, 90)),
    });
    const url = `${MC_URL}?${params}`;

    let series: any[] = [];
    try {
      const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const rows = json?.data || json?.result || [];
        series = rows.map((r: any) => ({
          date: r.date || r.tradeDate,
          fiiNet: Number(r.fii_net || r.fiiNet || r.FII || 0),
          diiNet: Number(r.dii_net || r.diiNet || r.DII || 0),
          fiiBuy: Number(r.fii_buy || r.fiiBuy || 0),
          fiiSell: Number(r.fii_sell || r.fiiSell || 0),
          diiBuy: Number(r.dii_buy || r.diiBuy || 0),
          diiSell: Number(r.dii_sell || r.diiSell || 0),
        }));
      }
    } catch {
      series = [];
    }

    // Fallback: synthetic placeholder if no source available
    // (In production, you'd run a daily cron that snapshots NSE into a DB.)
    if (series.length === 0) {
      const today = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        series.push({
          date: d.toISOString().split("T")[0],
          fiiNet: null,
          diiNet: null,
          synthetic: true,
        });
      }
      cache = { data: { data: series, note: "Historical source unavailable. See README for cron setup." }, ts: Date.now() };
      return NextResponse.json({ source: "fallback", days, ...cache.data });
    }

    cache = { data: { data: series }, ts: Date.now() };
    return NextResponse.json({ source: "live", days, ...cache.data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}
