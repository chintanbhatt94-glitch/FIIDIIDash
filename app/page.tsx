// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import TermsModal from "@/components/TermsModal";
import QuoteTile from "@/components/QuoteTile";
import FiiDiiHeadline from "@/components/FiiDiiHeadline";
import FiiDiiHistoryChart from "@/components/FiiDiiHistoryChart";
import FiiNiftyCorrelation from "@/components/FiiNiftyCorrelation";
import SectorHeatmap from "@/components/SectorHeatmap";
import SentimentDial from "@/components/SentimentDial";
import StockTable from "@/components/StockTable";
import OptionChainPanel from "@/components/OptionChainPanel";
import HistoricalChart from "@/components/HistoricalChart";
import AICommentary from "@/components/AICommentary";
import { SYMBOLS } from "@/lib/symbols";

export default function Page() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isMarketOpen = (() => {
    const d = new Date();
    const ist = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = ist.getDay();
    if (day === 0 || day === 6) return false;
    const mins = ist.getHours() * 60 + ist.getMinutes();
    return mins >= 555 && mins <= 930;
  })();

  return (
    <>
      <TermsModal />
      <main className="dash">
        <header className="header">
          <div>
            <div className="brand">India Markets Terminal</div>
            <div className="brand-sub">Institutional Dashboard · Resolute Group</div>
          </div>
          <div className="meta">
            <div>
              <span className={`status-dot ${isMarketOpen ? "live" : "closed"}`} />
              {isMarketOpen ? "Market Open" : "Market Closed"}
            </div>
            <div className="mt-2"><strong>{now}</strong> IST</div>
          </div>
        </header>

        {/* HEADLINE INDICES */}
        <div className="section-title">Indices</div>
        <div className="tile-grid">
          <QuoteTile symbol={SYMBOLS.NIFTY} label="Nifty 50" />
          <QuoteTile symbol={SYMBOLS.BANKNIFTY} label="Bank Nifty" />
          <QuoteTile symbol={SYMBOLS.SENSEX} label="Sensex" />
          <QuoteTile symbol={SYMBOLS.INDIA_VIX} label="India VIX" />
          <QuoteTile symbol={SYMBOLS.USD_INR} label="USD/INR" dp={3} prefix="₹" />
          <QuoteTile symbol={SYMBOLS.US_10Y} label="US 10Y" dp={3} />
          <QuoteTile symbol={SYMBOLS.BRENT} label="Brent" dp={2} prefix="$" />
          <QuoteTile symbol={SYMBOLS.GOLD} label="Gold" dp={2} prefix="$" />
        </div>

        {/* FII/DII COMMAND CENTER */}
        <div className="section-title">FII / DII Command Center</div>
        <FiiDiiHeadline />

        <div style={{ height: 20 }} />

        <div className="row-2">
          <FiiDiiHistoryChart />
          <FiiNiftyCorrelation />
        </div>

        <div style={{ height: 20 }} />

        <SectorHeatmap />

        {/* MARKET PULSE */}
        <div className="section-title">Market Pulse</div>
        <div className="row-2-3">
          <HistoricalChart />
          <SentimentDial />
        </div>

        <div style={{ height: 20 }} />

        <OptionChainPanel />

        {/* STOCKS */}
        <div className="section-title">Stocks</div>
        <div className="row-2">
          <StockTable mode="watchlist" title="Watchlist" subtitle="Custom tracked stocks" />
          <StockTable mode="fii-favorites" title="High FII Holding" subtitle="Top 20 by foreign holding · refreshed quarterly" />
        </div>

        <div style={{ height: 20 }} />

        <div className="row-3">
          <StockTable mode="gainers" title="Top Gainers" subtitle="Today's leaders · large-cap" />
          <StockTable mode="losers" title="Top Losers" subtitle="Today's laggards · large-cap" />
          <StockTable mode="active" title="Most Active" subtitle="By traded value" />
        </div>

        {/* AI COMMENTARY */}
        <div className="section-title">Commentary</div>
        <AICommentary />

        <footer className="foot">
          <p style={{ marginBottom: 10 }}>
            <em>Insights are analytical in nature and not investment advice.</em>
          </p>
          <p style={{ marginBottom: 6 }}>
            This dashboard provides general market information for educational purposes only. The publisher is
            not a SEBI-registered Investment Adviser or Research Analyst. Nothing herein constitutes a recommendation
            to buy, sell, or hold any security. Past performance is not indicative of future results.
          </p>
          <p>
            Data: Yahoo Finance · NSE provisional · ~15 min delay on indices · Refresh cycles: tiles 30s · charts 60s · option chain 2m · FII/DII flows 5m
          </p>
        </footer>
      </main>
    </>
  );
}
