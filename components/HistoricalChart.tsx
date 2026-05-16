// components/HistoricalChart.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RANGES = [
  { key: "5d", label: "5D" },
  { key: "1mo", label: "1M" },
  { key: "3mo", label: "3M" },
  { key: "6mo", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "5y", label: "5Y" },
];

const INDEX_OPTIONS = [
  { key: "^NSEI", label: "Nifty 50" },
  { key: "^NSEBANK", label: "Bank Nifty" },
  { key: "^INDIAVIX", label: "India VIX" },
  { key: "INR=X", label: "USD/INR" },
];

export default function HistoricalChart() {
  const [symbol, setSymbol] = useState("^NSEI");
  const [range, setRange] = useState("3mo");

  const { data } = useSWR(
    `/api/historical?symbol=${encodeURIComponent(symbol)}&range=${range}`,
    fetcher,
    { refreshInterval: 60 * 1000 }
  );

  const series = data?.data || [];
  const label = INDEX_OPTIONS.find((o) => o.key === symbol)?.label || symbol;
  const last = series[series.length - 1]?.close;
  const first = series[0]?.close;
  const chg = last && first ? last - first : 0;
  const pct = first ? (chg / first) * 100 : 0;
  const dir = chg >= 0 ? "up" : "down";

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>{label}</h2>
          <div className="sub">
            {last && (
              <>
                <span style={{ color: "var(--ink)" }}>{last.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                <span className={dir} style={{ marginLeft: 10 }}>
                  {chg > 0 ? "+" : ""}{chg.toFixed(2)} ({pct.toFixed(2)}%) · {range.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="tabs">
          {RANGES.map((r) => (
            <button key={r.key} className={r.key === range ? "active" : ""} onClick={() => setRange(r.key)}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 14 }}>
        {INDEX_OPTIONS.map((o) => (
          <button key={o.key} className={o.key === symbol ? "active" : ""} onClick={() => setSymbol(o.key)}>{o.label}</button>
        ))}
      </div>

      <div style={{ height: 280 }}>
        {!data ? (
          <div className="skel" style={{ height: "100%", width: "100%" }} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chg >= 0 ? "#7fb069" : "#d97757"} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chg >= 0 ? "#7fb069" : "#d97757"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#25272b" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="date" stroke="#6b6862" fontSize={10} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis stroke="#6b6862" fontSize={10} tickLine={false} axisLine={false} domain={["dataMin", "dataMax"]}
                tickFormatter={(v) => v.toLocaleString("en-IN", { maximumFractionDigits: 0 })} />
              <Tooltip contentStyle={{ background: "#18191c", border: "1px solid #35383d", fontFamily: "JetBrains Mono", fontSize: 11 }}
                labelStyle={{ color: "#a8a39a" }} />
              <Area type="monotone" dataKey="close" stroke={chg >= 0 ? "#7fb069" : "#d97757"} strokeWidth={1.5} fill="url(#hg)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
