// app/api/sector-proxy/route.ts
// Sector performance heatmap as a proxy for FII sectoral flows.
// Methodology: free APIs don't expose daily FII sector buying. We instead show
// which sectors outperformed/underperformed today — useful as an inference signal
// when combined with the FII cash flow direction.
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { SECTOR_INDICES } from "@/lib/symbols";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);
    const results = await yahooFinance.quote(SECTOR_INDICES.map((s) => s.key));
    const arr = Array.isArray(results) ? results : [results];
    const nameMap = Object.fromEntries(SECTOR_INDICES.map((s) => [s.key, s.name]));

    const data = arr.map((q: any) => ({
      name: nameMap[q.symbol] || q.symbol,
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
    })).sort((a: any, b: any) => (b.changePercent || 0) - (a.changePercent || 0));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data,
      methodology: "Sector index performance proxy. Free APIs do not expose daily FII sector flows; this shows relative strength as an inference signal.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
