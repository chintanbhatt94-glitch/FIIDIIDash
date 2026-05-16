// app/api/option-chain/route.ts
// GET /api/option-chain?symbol=NIFTY  or  ?symbol=BANKNIFTY
// Returns PCR, Max Pain, ATM strike, and the option chain

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: Record<string, { data: any; ts: number }> = {};
const CACHE_MS = 2 * 60 * 1000; // 2-minute cache

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/option-chain",
};

async function fetchOptionChain(symbol: string) {
  const url = `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`;

  // Warm-up
  const home = await fetch("https://www.nseindia.com", { headers: HEADERS, cache: "no-store" });
  const cookies = home.headers.get("set-cookie") || "";

  const res = await fetch(url, {
    headers: { ...HEADERS, Cookie: cookies },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`NSE returned ${res.status}`);
  return res.json();
}

function analyzeChain(payload: any) {
  // Nearest expiry only (first one in the list)
  const records = payload?.records?.data || [];
  const expiryDates: string[] = payload?.records?.expiryDates || [];
  const nearestExpiry = expiryDates[0];

  const nearExpiryData = records.filter(
    (r: any) => r.expiryDate === nearestExpiry
  );

  let totalCallOI = 0;
  let totalPutOI = 0;
  const strikes: any[] = [];

  for (const row of nearExpiryData) {
    const ce = row.CE;
    const pe = row.PE;
    const callOI = ce?.openInterest ?? 0;
    const putOI = pe?.openInterest ?? 0;
    totalCallOI += callOI;
    totalPutOI += putOI;

    strikes.push({
      strike: row.strikePrice,
      callOI,
      callChgOI: ce?.changeinOpenInterest ?? 0,
      callLTP: ce?.lastPrice ?? 0,
      callIV: ce?.impliedVolatility ?? 0,
      putOI,
      putChgOI: pe?.changeinOpenInterest ?? 0,
      putLTP: pe?.lastPrice ?? 0,
      putIV: pe?.impliedVolatility ?? 0,
    });
  }

  const pcr = totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
  const underlying = payload?.records?.underlyingValue || 0;

  // ATM strike: closest to underlying
  const atm = strikes.reduce((closest, s) =>
    Math.abs(s.strike - underlying) < Math.abs(closest.strike - underlying) ? s : closest
  , strikes[0]);

  // Max Pain: strike with min sum of (Call OI * max(0, S-K) + Put OI * max(0, K-S))
  // for each candidate strike K
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
    strikes: strikes.sort((a, b) => a.strike - b.strike),
    sentiment:
      pcr > 1.2 ? "Bullish (contrarian: PCR > 1.2)" :
      pcr < 0.8 ? "Bearish (PCR < 0.8)" :
      "Neutral",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "NIFTY").toUpperCase();

  if (!["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"].includes(symbol)) {
    return NextResponse.json(
      { error: "symbol must be NIFTY, BANKNIFTY, FINNIFTY, or MIDCPNIFTY" },
      { status: 400 }
    );
  }

  try {
    const cached = cache[symbol];
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      return NextResponse.json({ source: "cache", ...cached.data });
    }

    const raw = await fetchOptionChain(symbol);
    const analyzed = analyzeChain(raw);
    cache[symbol] = { data: analyzed, ts: Date.now() };

    return NextResponse.json({ source: "live", ...analyzed });
  } catch (err: any) {
    if (cache[symbol]) {
      return NextResponse.json({
        source: "stale-cache",
        warning: "NSE fetch failed; returning cached data",
        error: err?.message,
        ...cache[symbol].data,
      });
    }
    return NextResponse.json(
      {
        error: "Failed to fetch option chain",
        details: err?.message,
        hint: "NSE may rate-limit server IPs in production. The dashboard will still work without this — option chain is a 'nice to have'.",
      },
      { status: 502 }
    );
  }
}
