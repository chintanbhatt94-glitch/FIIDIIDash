// app/api/global/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { SYMBOLS } from "@/lib/symbols";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BATCH = [
  SYMBOLS.USD_INR, SYMBOLS.US_10Y, SYMBOLS.DXY,
  SYMBOLS.BRENT, SYMBOLS.GOLD,
  SYMBOLS.SPX, SYMBOLS.VIX_US,
  SYMBOLS.HANGSENG,
];

export async function GET() {
  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);
    const results = await yahooFinance.quote(BATCH);
    const arr = Array.isArray(results) ? results : [results];
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data: arr.map((q: any) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
