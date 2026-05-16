// components/OptionChainPanel.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const fmt = (n: number | null | undefined) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

export default function OptionChainPanel() {
  const [symbol, setSymbol] = useState<"NIFTY" | "BANKNIFTY">("NIFTY");

  const { data, error } = useSWR(
    `/api/option-chain?symbol=${symbol}`,
    fetcher,
    { refreshInterval: 2 * 60 * 1000 }
  );

  const sentClass =
    !data?.sentiment ? "neutral" :
    data.sentiment.includes("Bullish") ? "bull" :
    data.sentiment.includes("Bearish") ? "bear" :
    "neutral";

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="chart-title-row">
          <h2>Options Positioning</h2>
          <div className="sub">PCR · Max Pain · ATM{data?.expiry ? ` · Exp ${data.expiry}` : ""}</div>
        </div>
      </div>

      <div className="symbol-selector">
        <button
          className={symbol === "NIFTY" ? "active" : ""}
          onClick={() => setSymbol("NIFTY")}
        >
          Nifty
        </button>
        <button
          className={symbol === "BANKNIFTY" ? "active" : ""}
          onClick={() => setSymbol("BANKNIFTY")}
        >
          Bank Nifty
        </button>
      </div>

      {error || data?.error ? (
        <div className="muted" style={{ padding: 16 }}>
          Option chain unavailable. NSE may be blocking server IPs. Refreshes every 2 min.
        </div>
      ) : !data ? (
        <div className="pcr-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pcr-cell skel" style={{ height: 60 }} />
          ))}
        </div>
      ) : (
        <>
          <div className="pcr-grid">
            <div className="pcr-cell">
              <div className="label">Spot</div>
              <div className="value">{fmt(data.underlying)}</div>
            </div>
            <div className="pcr-cell">
              <div className="label">PCR (OI)</div>
              <div className="value">{fmt(data.pcr)}</div>
            </div>
            <div className="pcr-cell">
              <div className="label">Max Pain</div>
              <div className="value">{fmt(data.maxPain)}</div>
            </div>
            <div className="pcr-cell">
              <div className="label">ATM Strike</div>
              <div className="value">{fmt(data.atm)}</div>
            </div>
          </div>

          <div className="row mt-4">
            <span className={`sentiment-tag ${sentClass}`}>
              {data.sentiment || "Neutral"}
            </span>
            <span className="spacer" />
            <span className="text-xs faint mono">
              Call OI {(data.totalCallOI / 1e7).toFixed(2)}Cr · Put OI{" "}
              {(data.totalPutOI / 1e7).toFixed(2)}Cr
            </span>
          </div>
        </>
      )}
    </div>
  );
}
