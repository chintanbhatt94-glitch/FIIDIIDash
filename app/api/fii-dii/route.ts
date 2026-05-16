// app/api/fii-dii/route.ts
// Returns latest FII/DII activity from NSE.
// Includes cash, F&O (index/stock futures and options), and debt where available.

import { NextResponse } from "next/server";
import { fetchNSE } from "@/lib/nse";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: { data: any; ts: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_MS) {
      return NextResponse.json({ source: "cache", ...cache.data });
    }

    // Cash market FII/DII
    const cashRaw = await fetchNSE(
      "/api/fiidiiTradeReact",
      "https://www.nseindia.com/reports/fii-dii"
    );

    // F&O FII statistics (index/stock futures & options open interest, buy/sell)
    let fnoRaw: any = null;
    try {
      fnoRaw = await fetchNSE(
        "/api/fiiparticipantStats",
        "https://www.nseindia.com/reports/fii-derivative-stats"
      );
    } catch {
      fnoRaw = null;
    }

    const fiiCash = cashRaw.find((r: any) =>
      String(r.category).toUpperCase().includes("FII") ||
      String(r.category).toUpperCase().includes("FPI")
    );
    const diiCash = cashRaw.find((r: any) =>
      String(r.category).toUpperCase().includes("DII")
    );

    const payload = {
      date: fiiCash?.date || diiCash?.date || new Date().toISOString().split("T")[0],
      cash: {
        fii: fiiCash ? {
          buy: Number(fiiCash.buyValue),
          sell: Number(fiiCash.sellValue),
          net: Number(fiiCash.netValue),
        } : null,
        dii: diiCash ? {
          buy: Number(diiCash.buyValue),
          sell: Number(diiCash.sellValue),
          net: Number(diiCash.netValue),
        } : null,
      },
      fno: fnoRaw,
    };

    cache = { data: payload, ts: Date.now() };
    return NextResponse.json({ source: "live", ...payload });
  } catch (err: any) {
    if (cache) {
      return NextResponse.json({
        source: "stale-cache",
        warning: "NSE fetch failed; returning cached data",
        ...cache.data,
      });
    }
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}
