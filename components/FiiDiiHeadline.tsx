// components/FiiDiiHeadline.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function fmtCr(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  const abs = Math.abs(n);
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(2)}K Cr`;
  return `${sign}₹${abs.toFixed(0)} Cr`;
}

function fnoSign(label: string, fno: any): { net: number | null; sub: string } {
  // Best-effort extraction from NSE's f&o stats payload
  if (!fno) return { net: null, sub: "no data" };
  const arr = Array.isArray(fno) ? fno : (fno.data || []);
  const m = arr.find((r: any) => String(r.instrumentType || r.instrument).toUpperCase().includes(label.toUpperCase()));
  if (!m) return { net: null, sub: "no data" };
  const buy = Number(m.buyAmount || m.buy || 0);
  const sell = Number(m.sellAmount || m.sell || 0);
  return { net: buy - sell, sub: `B ${buy.toFixed(0)} · S ${sell.toFixed(0)}` };
}

export default function FiiDiiHeadline() {
  const { data, error } = useSWR("/api/fii-dii", fetcher, { refreshInterval: 5 * 60 * 1000 });

  if (error || data?.error) {
    return (
      <div className="card">
        <div className="card-head">
          <div>
            <h2>FII / DII Snapshot</h2>
            <div className="sub">Today's flows</div>
          </div>
        </div>
        <div className="muted">Data temporarily unavailable. NSE rate-limits servers periodically; refresh in a minute.</div>
      </div>
    );
  }

  const loading = !data;
  const fiiCash = data?.cash?.fii;
  const diiCash = data?.cash?.dii;
  const indexFut = fnoSign("INDEX_FUT", data?.fno);
  const indexOpt = fnoSign("INDEX_OPT", data?.fno);
  const stockFut = fnoSign("STOCK_FUT", data?.fno);

  const cls = (n: number | null | undefined) =>
    n === null || n === undefined ? "flat" : n > 0 ? "up" : n < 0 ? "down" : "flat";

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>FII / DII Snapshot</h2>
          <div className="sub">{data?.date ? `Provisional · ${data.date}` : "Today's flows"}</div>
        </div>
      </div>

      {data?.warning && <div className="warn">{data.warning}</div>}

      <div className="flow-grid-5">
        <div className="flow-tile">
          <div className="label">FII Cash</div>
          <div className={`value ${cls(fiiCash?.net)}`}>
            {loading ? <span className="skel" style={{ display: "inline-block", height: 22, width: 80 }} /> : fmtCr(fiiCash?.net)}
          </div>
          <div className="sub">
            {loading ? "" : fiiCash ? `B ${(fiiCash.buy || 0).toFixed(0)} · S ${(fiiCash.sell || 0).toFixed(0)}` : "—"}
          </div>
        </div>
        <div className="flow-tile">
          <div className="label">DII Cash</div>
          <div className={`value ${cls(diiCash?.net)}`}>
            {loading ? <span className="skel" style={{ display: "inline-block", height: 22, width: 80 }} /> : fmtCr(diiCash?.net)}
          </div>
          <div className="sub">
            {loading ? "" : diiCash ? `B ${(diiCash.buy || 0).toFixed(0)} · S ${(diiCash.sell || 0).toFixed(0)}` : "—"}
          </div>
        </div>
        <div className="flow-tile">
          <div className="label">FII Index Fut</div>
          <div className={`value ${cls(indexFut.net)}`}>{fmtCr(indexFut.net)}</div>
          <div className="sub">{indexFut.sub}</div>
        </div>
        <div className="flow-tile">
          <div className="label">FII Index Opt</div>
          <div className={`value ${cls(indexOpt.net)}`}>{fmtCr(indexOpt.net)}</div>
          <div className="sub">{indexOpt.sub}</div>
        </div>
        <div className="flow-tile">
          <div className="label">FII Stock Fut</div>
          <div className={`value ${cls(stockFut.net)}`}>{fmtCr(stockFut.net)}</div>
          <div className="sub">{stockFut.sub}</div>
        </div>
      </div>

      <div className="text-xs faint mt-4">
        Source: NSE provisional · Refreshes every 5 min · F&O data may be delayed to T+1
      </div>
    </div>
  );
}
