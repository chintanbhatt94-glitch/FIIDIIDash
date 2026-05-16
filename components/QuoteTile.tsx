// components/QuoteTile.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmt(n: number | null | undefined, dp = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export default function QuoteTile({
  symbol,
  label,
  dp = 2,
  prefix = "",
}: {
  symbol: string;
  label: string;
  dp?: number;
  prefix?: string;
}) {
  const { data, error } = useSWR(
    `/api/quote?symbol=${encodeURIComponent(symbol)}`,
    fetcher,
    { refreshInterval: 30000 } // refresh every 30s
  );

  if (error || data?.error) {
    return (
      <div className="tile">
        <div className="tile-label">{label}</div>
        <div className="tile-price faint">—</div>
        <div className="tile-change faint">offline</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="tile">
        <div className="tile-label">{label}</div>
        <div className="tile-price skel" style={{ height: 28, width: "70%" }}>&nbsp;</div>
        <div className="tile-change skel" style={{ height: 12, width: "50%" }}>&nbsp;</div>
      </div>
    );
  }

  const chg = data.change ?? 0;
  const pct = data.changePercent ?? 0;
  const cls = chg > 0 ? "up" : chg < 0 ? "down" : "flat";
  const arrow = chg > 0 ? "▲" : chg < 0 ? "▼" : "▪";

  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className="tile-price">{prefix}{fmt(data.price, dp)}</div>
      <div className={`tile-change ${cls}`}>
        {arrow} {fmt(chg, dp)} ({fmt(pct, 2)}%)
      </div>
    </div>
  );
}
