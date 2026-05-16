// components/StockTable.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmt(n: number | null | undefined, dp = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

function compact(n: number | null | undefined) {
  if (!n) return "—";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}

type Mode = "watchlist" | "fii-favorites" | "gainers" | "losers" | "active";

export default function StockTable({
  mode, title, subtitle,
}: { mode: Mode; title: string; subtitle: string }) {
  let url = "";
  let pickKey: "data" | "gainers" | "losers" | "active" = "data";

  if (mode === "watchlist") url = "/api/watchlist?list=watchlist";
  else if (mode === "fii-favorites") url = "/api/watchlist?list=fii-favorites";
  else { url = "/api/movers"; pickKey = mode as any; }

  const { data, error } = useSWR(url, fetcher, { refreshInterval: 60 * 1000 });

  const rows = data ? (data[pickKey] || []) : [];

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>{title}</h2>
          <div className="sub">{subtitle}</div>
        </div>
      </div>

      {error ? (
        <div className="muted">Data unavailable.</div>
      ) : !data ? (
        <div className="skel" style={{ height: 200 }} />
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Symbol</th>
              <th className="num">LTP</th>
              <th className="num">Chg %</th>
              <th className="num">Vol</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((s: any) => {
              const pct = s.changePercent || 0;
              const cls = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
              const label = s.label || s.symbol?.replace(".NS", "");
              return (
                <tr key={s.symbol}>
                  <td className="lbl-cell">{label}</td>
                  <td className="num">{fmt(s.price)}</td>
                  <td className={`num ${cls}`}>
                    {pct > 0 ? "+" : ""}{fmt(pct, 2)}%
                  </td>
                  <td className="num faint">{compact(s.volume)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
