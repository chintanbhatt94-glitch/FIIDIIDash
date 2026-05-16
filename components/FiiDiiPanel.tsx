// components/FiiDiiPanel.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmtCr(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "+";
  return `${sign}₹${Math.abs(n).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })} Cr`;
}

export default function FiiDiiPanel() {
  const { data, error } = useSWR("/api/fii-dii", fetcher, {
    refreshInterval: 5 * 60 * 1000, // every 5 min
  });

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="chart-title-row">
          <h2>Institutional Flows</h2>
          <div className="sub">
            FII / DII Cash Market{data?.date ? ` · ${data.date}` : ""}
          </div>
        </div>
      </div>

      {data?.warning && <div className="warn">{data.warning}</div>}

      {error || data?.error ? (
        <div className="muted" style={{ padding: 20 }}>
          Flows currently unavailable. NSE rate-limits cloud server IPs; this can be
          intermittent. Refresh in a minute, or set up a scheduled cache job (see README).
        </div>
      ) : !data ? (
        <div className="flow-grid">
          <div className="flow-card skel" style={{ height: 100 }} />
          <div className="flow-card skel" style={{ height: 100 }} />
        </div>
      ) : (
        <div className="flow-grid">
          <div className="flow-card fii">
            <div className="flow-label">FII / FPI Cash</div>
            <div
              className={`flow-net ${
                (data.fii?.net ?? 0) > 0 ? "up" : (data.fii?.net ?? 0) < 0 ? "down" : "flat"
              }`}
            >
              {fmtCr(data.fii?.net)}
            </div>
            <div className="flow-bs">
              Buy ₹{(data.fii?.buy || 0).toLocaleString("en-IN")} · Sell ₹
              {(data.fii?.sell || 0).toLocaleString("en-IN")} Cr
            </div>
          </div>

          <div className="flow-card dii">
            <div className="flow-label">DII Cash</div>
            <div
              className={`flow-net ${
                (data.dii?.net ?? 0) > 0 ? "up" : (data.dii?.net ?? 0) < 0 ? "down" : "flat"
              }`}
            >
              {fmtCr(data.dii?.net)}
            </div>
            <div className="flow-bs">
              Buy ₹{(data.dii?.buy || 0).toLocaleString("en-IN")} · Sell ₹
              {(data.dii?.sell || 0).toLocaleString("en-IN")} Cr
            </div>
          </div>
        </div>
      )}

      <div className="text-xs faint mt-4">
        Source: NSE provisional. Refreshes every 5 minutes.
      </div>
    </div>
  );
}
