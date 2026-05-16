// app/api/quote/route.ts
// GET /api/quote?symbol=^NSEI  -> live quote
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

// Force this route to be dynamic (always fresh; no static caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter required" }, { status: 400 });
  }

  try {
    // yahoo-finance2 suppress the deprecation notice
    yahooFinance.suppressNotices(["yahooSurvey"]);

    const quote = await yahooFinance.quote(symbol);

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      previousClose: quote.regularMarketPreviousClose,
      volume: quote.regularMarketVolume,
      currency: quote.currency,
      marketState: quote.marketState,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch quote", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
