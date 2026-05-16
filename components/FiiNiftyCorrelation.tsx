// components/FiiNiftyCorrelation.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, ReferenceLine,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RANGES = [
  { key: 30, range: "1mo", label: "30D" },
  { key: 60, range: "3mo", label: "60D" },
  { key: 90, range: "3mo", label: "90D" },
];

export default function FiiNiftyCorrelation() {
  const [sel, setSel] = useState(RANGES[0]);

  const { data: fiiData } = useSWR(`/api/fii-dii-history?days=${sel.key}`, fetcher);
  const { data: niftyData } = useSWR(`/api/historical?symbol=%5ENSEI&range=${sel.range}`, fetcher);

  // Merge by date
  const niftyMap: Record<string, number> = {};
  (niftyData?.data || []).forEach((r: any) => { niftyMap[r.date] = r.close; });

  const series = (fiiData?.data || [])
    .map((r: any) => ({
      date: r.date,
      FII: r.fiiNet,
      Nifty: niftyMap[r.date] ?? null,
    }))
    .filter((r: any) => r.FII !== null && r.Nifty !== null);

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>FII vs Nifty</h2>
          <div className="sub">Net flows (bars) vs index level (line)</div>
        </div>
        <div className="tabs">
          {RANGES.map((r) => (
            <button key={r.key} className={r.key === sel.key ? "active" : ""} onClick={() => setSel(r)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 280 }}>
        {!fiiData || !niftyData ? (
          <div className="skel" style={{ width: "100%", height: "100%" }} />
        ) : series.length === 0 ? (
          <div className="muted" style={{ padding: 20 }}>
            Insufficient overlapping data. Historical FII source needs to populate (see README).
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#25272b" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="date" stroke="#6b6862" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis yAxisId="fii" orientation="left" stroke="#c9a96e" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
              <YAxis yAxisId="nifty" orientation="right" stroke="#7fb069" fontSize={10} tickLine={false} axisLine={false}
                domain={["dataMin", "dataMax"]} tickFormatter={(v) => v.toLocaleString("en-IN", { maximumFractionDigits: 0 })} />
              <Tooltip contentStyle={{ background: "#18191c", border: "1px solid #35383d", fontFamily: "JetBrains Mono", fontSize: 11 }}
                labelStyle={{ color: "#a8a39a" }} />
              <ReferenceLine yAxisId="fii" y={0} stroke="#35383d" />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
              <Bar yAxisId="fii" dataKey="FII" fill="#c9a96e" />
              <Line yAxisId="nifty" type="monotone" dataKey="Nifty" stroke="#7fb069" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
