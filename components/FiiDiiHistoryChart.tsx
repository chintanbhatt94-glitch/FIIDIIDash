// components/FiiDiiHistoryChart.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const RANGES = [
  { key: 30, label: "30D" },
  { key: 60, label: "60D" },
  { key: 90, label: "90D" },
];

export default function FiiDiiHistoryChart() {
  const [days, setDays] = useState(30);
  const { data, error } = useSWR(`/api/fii-dii-history?days=${days}`, fetcher, {
    refreshInterval: 60 * 60 * 1000,
  });

  const series = (data?.data || []).map((r: any) => ({
    date: r.date,
    FII: r.fiiNet,
    DII: r.diiNet,
  }));

  const hasData = series.some((r: any) => r.FII !== null);

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Flow History</h2>
          <div className="sub">FII vs DII net activity · ₹ Cr</div>
        </div>
        <div className="tabs">
          {RANGES.map((r) => (
            <button key={r.key} className={r.key === days ? "active" : ""} onClick={() => setDays(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data?.note && <div className="warn">{data.note}</div>}

      <div style={{ height: 280 }}>
        {error || !data ? (
          <div className="skel" style={{ width: "100%", height: "100%" }} />
        ) : !hasData ? (
          <div className="muted" style={{ padding: 20 }}>
            Historical FII/DII source unavailable on this deployment. The dashboard's
            in-memory snapshot will build up over time as you visit daily, or set up
            the daily cron described in the README for permanent history.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#25272b" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="date" stroke="#6b6862" fontSize={10}
                tickLine={false} axisLine={false} minTickGap={30}
              />
              <YAxis
                stroke="#6b6862" fontSize={10}
                tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`}
              />
              <Tooltip
                contentStyle={{ background: "#18191c", border: "1px solid #35383d", fontFamily: "JetBrains Mono", fontSize: 11 }}
                labelStyle={{ color: "#a8a39a" }}
              />
              <ReferenceLine y={0} stroke="#35383d" />
              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
              <Bar dataKey="FII" fill="#c9a96e" />
              <Bar dataKey="DII" fill="#7fb069" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
