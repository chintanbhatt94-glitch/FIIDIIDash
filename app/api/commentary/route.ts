// app/api/commentary/route.ts
// AI-generated market commentary using Anthropic API.
// Requires ANTHROPIC_API_KEY env var. Without it, returns a polite "configure key" message.
//
// SEBI-safe prompt: no buy/sell language, no price targets, no recommendations.
// Pure descriptive analysis of what flows and prices did.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cache: { text: string; ts: number } | null = null;
const CACHE_MS = 30 * 60 * 1000; // 30 min — commentary refreshes twice an hour max

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

const SYSTEM_PROMPT = `You are an institutional market strategist writing for a SEBI-compliant Indian markets dashboard.

Write a 120-180 word market commentary based on the data provided. Style: professional, descriptive, institutional brokerage tone (think Goldman Sachs / Kotak Institutional Equities daily note).

STRICT RULES (regulatory compliance):
- DO NOT use words: "buy", "sell", "recommend", "target", "should invest", "advisable to purchase"
- DO NOT mention individual stocks by name
- DO NOT make price predictions or call directional moves
- DO describe what flows and prices did, and what positioning suggests
- DO use observational language: "the data indicates", "positioning suggests", "flows reflect"
- DO be specific with numbers from the data
- End with: "Insights are analytical in nature and not investment advice."

The reader is a finance professional. Write as a peer briefing, not retail education.`;

export async function GET(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      message: "Set ANTHROPIC_API_KEY in Vercel environment variables to enable AI commentary. See README.",
    });
  }

  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json({ source: "cache", configured: true, text: cache.text, generatedAt: new Date(cache.ts).toISOString() });
  }

  try {
    const base = getBaseUrl(request);

    // Pull the data we'll feed the model
    const [sentiment, fiiDii, ocNifty, sector] = await Promise.all([
      fetch(`${base}/api/sentiment`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${base}/api/fii-dii`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${base}/api/option-chain?symbol=NIFTY`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch(`${base}/api/sector-proxy`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
    ]);

    const context = `
MARKET DATA SNAPSHOT (${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST):

Nifty change today: ${sentiment?.components?.niftyChange?.toFixed(2)}%
India VIX: ${sentiment?.components?.vix?.toFixed(2)}
FII Cash Net: ₹${fiiDii?.cash?.fii?.net?.toFixed(0) || "n/a"} Cr
DII Cash Net: ₹${fiiDii?.cash?.dii?.net?.toFixed(0) || "n/a"} Cr
Nifty PCR: ${ocNifty?.pcr || "n/a"}
Nifty Max Pain: ${ocNifty?.maxPain || "n/a"}
Sentiment Reading: ${sentiment?.label}

Sector performance (top 3 / bottom 3):
${sector?.data?.slice(0, 3).map((s: any) => `${s.name}: ${s.changePercent?.toFixed(2)}%`).join(", ")}
${sector?.data?.slice(-3).map((s: any) => `${s.name}: ${s.changePercent?.toFixed(2)}%`).join(", ")}

Sentiment reasoning bullets: ${sentiment?.reasoning?.join("; ")}
`;

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: context }],
    });

    const text = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    cache = { text, ts: Date.now() };
    return NextResponse.json({
      source: "live",
      configured: true,
      text,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    if (cache) {
      return NextResponse.json({ source: "stale-cache", configured: true, text: cache.text, error: err?.message });
    }
    return NextResponse.json({ configured: true, error: err?.message }, { status: 500 });
  }
}
