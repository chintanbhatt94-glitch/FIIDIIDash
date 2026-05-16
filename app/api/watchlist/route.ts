// app/api/watchlist/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { WATCHLIST, FII_FAVORITES } from "@/data/watchlist";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const list = searchParams.get("list") || "watchlist"; // "watchlist" or "fii-favorites"

  const source = list === "fii-favorites" ? FII_FAVORITES : WATCHLIST;
  const symbols = source.map((s) => s.symbol);
  const labelMap = Object.fromEntries(source.map((s) => [s.symbol, s.label]));

  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);
    const results = await yahooFinance.quote(symbols);
    const arr = Array.isArray(results) ? results : [results];
    return NextResponse.json({
      list,
      data: arr.map((q: any) => ({
        symbol: q.symbol,
        label: labelMap[q.symbol] || q.symbol,
        name: q.shortName || q.longName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        volume: q.regularMarketVolume,
        marketCap: q.marketCap,
        dayHigh: q.regularMarketDayHigh,
        dayLow: q.regularMarketDayLow,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
