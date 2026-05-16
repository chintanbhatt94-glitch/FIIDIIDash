// app/api/sentiment/route.ts
// Computes a Bullish/Neutral/Bearish reading from FII flow, PCR, VIX, and price action.
// Broad-market only — NEVER applied to individual stocks (SEBI compliance).

import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { SYMBOLS } from "@/lib/symbols";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const base = getBaseUrl(request);

  try {
    yahooFinance.suppressNotices(["yahooSurvey"]);

    // 1. Pull live data in parallel
    const [niftyQuote, vixQuote, fiiDiiRes, ocNiftyRes] = await Promise.all([
      yahooFinance.quote(SYMBOLS.NIFTY),
      yahooFinance.quote(SYMBOLS.INDIA_VIX),
      fetch(`${base}/api/fii-dii`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${base}/api/option-chain?symbol=NIFTY`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);

    const niftyChg = (niftyQuote as any).regularMarketChangePercent || 0;
    const vix = (vixQuote as any).regularMarketPrice || 0;
    const fiiNet = fiiDiiRes?.cash?.fii?.net || 0;
    const diiNet = fiiDiiRes?.cash?.dii?.net || 0;
    const pcr = ocNiftyRes?.pcr || 1;

    // 2. Score each component (-2 bearish to +2 bullish)
    let score = 0;
    const reasoning: string[] = [];

    // Nifty price action
    if (niftyChg > 0.75) { score += 2; reasoning.push(`Nifty up ${niftyChg.toFixed(2)}% — strong intraday`); }
    else if (niftyChg > 0.25) { score += 1; reasoning.push(`Nifty up ${niftyChg.toFixed(2)}% — modestly positive`); }
    else if (niftyChg < -0.75) { score -= 2; reasoning.push(`Nifty down ${niftyChg.toFixed(2)}% — sharp decline`); }
    else if (niftyChg < -0.25) { score -= 1; reasoning.push(`Nifty down ${niftyChg.toFixed(2)}% — softer tone`); }
    else { reasoning.push(`Nifty flat at ${niftyChg.toFixed(2)}%`); }

    // FII cash flow
    if (fiiNet > 2000) { score += 2; reasoning.push(`FII strong buyers: +₹${fiiNet.toFixed(0)} Cr`); }
    else if (fiiNet > 500) { score += 1; reasoning.push(`FII net buying: +₹${fiiNet.toFixed(0)} Cr`); }
    else if (fiiNet < -2000) { score -= 2; reasoning.push(`FII heavy selling: ₹${fiiNet.toFixed(0)} Cr`); }
    else if (fiiNet < -500) { score -= 1; reasoning.push(`FII net selling: ₹${fiiNet.toFixed(0)} Cr`); }
    else if (fiiNet !== 0) { reasoning.push(`FII flows muted: ₹${fiiNet.toFixed(0)} Cr`); }

    // DII flow (counterbalance)
    if (diiNet > 1000 && fiiNet < 0) { score += 1; reasoning.push(`DII absorbing supply: +₹${diiNet.toFixed(0)} Cr`); }

    // VIX
    if (vix > 20) { score -= 2; reasoning.push(`VIX elevated at ${vix.toFixed(2)} — risk-off`); }
    else if (vix > 15) { score -= 1; reasoning.push(`VIX above 15 (${vix.toFixed(2)}) — caution`); }
    else if (vix < 12) { score += 1; reasoning.push(`VIX low at ${vix.toFixed(2)} — complacent`); }
    else { reasoning.push(`VIX moderate at ${vix.toFixed(2)}`); }

    // PCR
    if (pcr > 1.3) { score += 1; reasoning.push(`PCR ${pcr.toFixed(2)} — heavy put writing, contrarian bullish`); }
    else if (pcr < 0.7) { score -= 1; reasoning.push(`PCR ${pcr.toFixed(2)} — call writers dominant, bearish`); }
    else { reasoning.push(`PCR ${pcr.toFixed(2)} — neutral positioning`); }

    // 3. Classify
    let label: string;
    let color: string;
    if (score >= 4) { label = "Strong Bullish"; color = "bull"; }
    else if (score >= 2) { label = "Bullish"; color = "bull"; }
    else if (score >= -1) { label = "Neutral"; color = "neutral"; }
    else if (score >= -3) { label = "Bearish"; color = "bear"; }
    else { label = "Strong Bearish"; color = "bear"; }

    return NextResponse.json({
      label,
      color,
      score,
      reasoning,
      components: {
        niftyChange: niftyChg,
        vix,
        fiiNet,
        diiNet,
        pcr,
      },
      disclaimer: "Analytical reading of market conditions. Not investment advice.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
