// app/api/quote/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);
    const q = await yahooFinance.quote(symbol);
    return NextResponse.json({
      symbol: q.symbol,
      name: q.shortName || q.longName || symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      open: q.regularMarketOpen,
      high: q.regularMarketDayHigh,
      low: q.regularMarketDayLow,
      previousClose: q.regularMarketPreviousClose,
      volume: q.regularMarketVolume,
      marketState: q.marketState,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
