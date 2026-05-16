// app/api/option-chain/route.ts
import { NextResponse } from "next/server";
import { fetchNSE } from "@/lib/nse";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: Record<string, { data: any; ts: number }> = {};
const CACHE_MS = 2 * 60 * 1000;

function analyzeChain(payload: any) {
  const records = payload?.records?.data || [];
  const expiryDates: string[] = payload?.records?.expiryDates || [];
  const nearestExpiry = expiryDates[0];
  const nearExpiryData = records.filter((r: any) => r.expiryDate === nearestExpiry);

  let totalCallOI = 0;
  let totalPutOI = 0;
  const strikes: any[] = [];

  for (const row of nearExpiryData) {
    const callOI = row.CE?.openInterest ?? 0;
    const putOI = row.PE?.openInterest ?? 0;
    totalCallOI += callOI;
    totalPutOI += putOI;
    strikes.push({
      strike: row.strikePrice,
      callOI,
      callChgOI: row.CE?.changeinOpenInterest ?? 0,
      putOI,
      putChgOI: row.PE?.changeinOpenInterest ?? 0,
    });
  }

  const pcr = totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
  const underlying = payload?.records?.underlyingValue || 0;

  const atm = strikes.reduce((closest, s) =>
    Math.abs(s.strike - underlying) < Math.abs(closest.strike - underlying) ? s : closest,
    strikes[0]
  );

  let maxPain = { strike: 0, value: Infinity };
  for (const k of strikes) {
    let total = 0;
    for (const s of strikes) {
      if (s.strike < k.strike) total += s.callOI * (k.strike - s.strike);
      if (s.strike > k.strike) total += s.putOI * (s.strike - k.strike);
    }
    if (total < maxPain.value) maxPain = { strike: k.strike, value: total };
  }

  return {
    expiry: nearestExpiry,
    underlying,
    pcr: Number(pcr.toFixed(3)),
    totalCallOI,
    totalPutOI,
    atm: atm?.strike,
    maxPain: maxPain.strike,
    sentiment:
      pcr > 1.2 ? "Bullish" :
      pcr < 0.8 ? "Bearish" : "Neutral",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "NIFTY").toUpperCase();

  if (!["NIFTY", "BANKNIFTY", "FINNIFTY"].includes(symbol)) {
    return NextResponse.json({ error: "invalid symbol" }, { status: 400 });
  }

  try {
    if (cache[symbol] && Date.now() - cache[symbol].ts < CACHE_MS) {
      return NextResponse.json({ source: "cache", ...cache[symbol].data });
    }
    const raw = await fetchNSE(
      `/api/option-chain-indices?symbol=${symbol}`,
      "https://www.nseindia.com/option-chain"
    );
    const analyzed = analyzeChain(raw);
    cache[symbol] = { data: analyzed, ts: Date.now() };
    return NextResponse.json({ source: "live", ...analyzed });
  } catch (err: any) {
    if (cache[symbol]) {
      return NextResponse.json({ source: "stale-cache", ...cache[symbol].data });
    }
    return NextResponse.json({ error: err?.message }, { status: 502 });
  }
}
