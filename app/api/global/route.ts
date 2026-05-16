// app/api/global/route.ts
// GET /api/global  -> batch fetch for the global macro tile
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { SYMBOLS } from "@/lib/symbols";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BATCH = [
  SYMBOLS.USD_INR,
  SYMBOLS.US_10Y,
  SYMBOLS.DXY,
  SYMBOLS.BRENT,
  SYMBOLS.GOLD,
  SYMBOLS.SPX,
  SYMBOLS.NDX,
  SYMBOLS.VIX_US,
  SYMBOLS.NIKKEI,
  SYMBOLS.HANGSENG,
];

export async function GET() {
  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);
    // yahoo-finance2 supports batch quote
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
        currency: q.currency,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch global", details: err?.message },
      { status: 500 }
    );
  }
}
