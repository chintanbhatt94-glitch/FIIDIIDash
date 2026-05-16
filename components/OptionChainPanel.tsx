// components/OptionChainPanel.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const fmt = (n: number | null | undefined) =>
  n === null || n === undefined || Number.isNaN(n) ? "—" : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function OptionChainPanel() {
  const [symbol, setSymbol] = useState<"NIFTY" | "BANKNIFTY">("NIFTY");
  const { data, error } = useSWR(`/api/option-chain?symbol=${symbol}`, fetcher, {
    refreshInterval: 2 * 60 * 1000,
  });

  const sentCls = data?.sentiment === "Bullish" ? "up" : data?.sentiment === "Bearish" ? "down" : "flat";

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Options Positioning</h2>
          <div className="sub">{data?.expiry ? `Expiry ${data.expiry}` : "PCR · Max Pain · ATM"}</div>
        </div>
        <div className="tabs">
          <button className={symbol === "NIFTY" ? "active" : ""} onClick={() => setSymbol("NIFTY")}>Nifty</button>
          <button className={symbol === "BANKNIFTY" ? "active" : ""} onClick={() => setSymbol("BANKNIFTY")}>BNK</button>
        </div>
      </div>

      {error || data?.error ? (
        <div className="muted">Option chain unavailable.</div>
      ) : !data ? (
        <div className="skel" style={{ height: 100 }} />
      ) : (
        <>
          <div className="flow-grid-5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            <div className="flow-tile">
              <div className="label">Spot</div>
              <div className="value">{fmt(data.underlying)}</div>
            </div>
            <div className="flow-tile">
              <div className="label">PCR</div>
              <div className={`value ${sentCls}`}>{fmt(data.pcr)}</div>
            </div>
            <div className="flow-tile">
              <div className="label">Max Pain</div>
              <div className="value">{fmt(data.maxPain)}</div>
            </div>
            <div className="flow-tile">
              <div className="label">ATM</div>
              <div className="value">{fmt(data.atm)}</div>
            </div>
          </div>
          <div className="text-xs faint mt-4">
            Sentiment reading: <span className={sentCls}>{data.sentiment}</span> · Call OI {(data.totalCallOI / 1e7).toFixed(2)}Cr · Put OI {(data.totalPutOI / 1e7).toFixed(2)}Cr
          </div>
        </>
      )}
    </div>
  );
}
