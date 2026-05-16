// app/api/historical/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function rangeToDates(range: string) {
  const end = new Date();
  const start = new Date();
  switch (range) {
    case "5d": start.setDate(end.getDate() - 7); break;
    case "1mo": start.setMonth(end.getMonth() - 1); break;
    case "3mo": start.setMonth(end.getMonth() - 3); break;
    case "6mo": start.setMonth(end.getMonth() - 6); break;
    case "1y": start.setFullYear(end.getFullYear() - 1); break;
    case "5y": start.setFullYear(end.getFullYear() - 5); break;
    default: start.setMonth(end.getMonth() - 3);
  }
  return { start, end };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") || "3mo";
  const interval = (searchParams.get("interval") || "1d") as "1d" | "1wk" | "1mo";
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);
    const { start, end } = rangeToDates(range);
    const result = await yahooFinance.chart(symbol, {
      period1: start, period2: end, interval,
    });
    const data = (result.quotes || []).map((r: any) => ({
      date: r.date instanceof Date ? r.date.toISOString().split("T")[0] : r.date,
      open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume,
    }));
    return NextResponse.json({ symbol, range, interval, data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
