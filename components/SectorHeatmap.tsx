// components/SectorHeatmap.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function heatColor(pct: number) {
  // Map pct in [-3, +3] to red→neutral→green
  const clamped = Math.max(-3, Math.min(3, pct));
  if (clamped > 0) {
    const intensity = clamped / 3;
    return `rgba(127, 176, 105, ${0.15 + intensity * 0.45})`;
  } else if (clamped < 0) {
    const intensity = Math.abs(clamped) / 3;
    return `rgba(217, 119, 87, ${0.15 + intensity * 0.45})`;
  }
  return "var(--bg-elev)";
}

export default function SectorHeatmap() {
  const { data, error } = useSWR("/api/sector-proxy", fetcher, { refreshInterval: 60 * 1000 });

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Sector Strength Map</h2>
          <div className="sub">Daily sector index performance · proxy for sectoral flow</div>
        </div>
      </div>

      {error ? (
        <div className="muted">Sector data unavailable.</div>
      ) : !data ? (
        <div className="skel" style={{ height: 100 }} />
      ) : (
        <>
          <div className="heat-grid">
            {data.data.map((s: any) => {
              const pct = s.changePercent || 0;
              return (
                <div key={s.symbol} className="heat-cell" style={{ background: heatColor(pct) }}>
                  <div className="name">{s.name}</div>
                  <div className={`val ${pct > 0 ? "up" : pct < 0 ? "down" : "flat"}`}>
                    {pct > 0 ? "+" : ""}{pct.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-xs faint mt-4" style={{ fontStyle: "italic" }}>
            Note: Free APIs do not expose daily FII sector flows. This panel shows
            sectoral price strength as an inference signal — interpret alongside FII cash direction.
          </div>
        </>
      )}
    </div>
  );
}
