// app/page.tsx
"use client";
import QuoteTile from "@/components/QuoteTile";
import HistoricalChart from "@/components/HistoricalChart";
import FiiDiiPanel from "@/components/FiiDiiPanel";
import OptionChainPanel from "@/components/OptionChainPanel";
import { SYMBOLS } from "@/lib/symbols";
import { useEffect, useState } from "react";

export default function Page() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Naive market-open detection (IST 9:15 - 15:30, Mon-Fri)
  const isMarketOpen = (() => {
    const d = new Date();
    const ist = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = ist.getDay();
    if (day === 0 || day === 6) return false;
    const mins = ist.getHours() * 60 + ist.getMinutes();
    return mins >= 555 && mins <= 930; // 9:15 to 15:30
  })();

  return (
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
          <div className="mt-2">
            <strong>{now}</strong> IST
          </div>
        </div>
      </header>

      {/* Indian indices */}
      <div className="section-title">Indian Indices</div>
      <div className="tile-grid">
        <QuoteTile symbol={SYMBOLS.NIFTY} label="Nifty 50" />
        <QuoteTile symbol={SYMBOLS.BANKNIFTY} label="Bank Nifty" />
        <QuoteTile symbol={SYMBOLS.SENSEX} label="Sensex" />
        <QuoteTile symbol={SYMBOLS.INDIA_VIX} label="India VIX" />
      </div>

      {/* Sector indices */}
      <div className="section-title">Sector Rotation</div>
      <div className="tile-grid">
        <QuoteTile symbol={SYMBOLS.NIFTY_IT} label="IT" />
        <QuoteTile symbol={SYMBOLS.NIFTY_AUTO} label="Auto" />
        <QuoteTile symbol={SYMBOLS.NIFTY_FMCG} label="FMCG" />
        <QuoteTile symbol={SYMBOLS.NIFTY_PHARMA} label="Pharma" />
        <QuoteTile symbol={SYMBOLS.NIFTY_METAL} label="Metal" />
        <QuoteTile symbol={SYMBOLS.NIFTY_ENERGY} label="Energy" />
        <QuoteTile symbol={SYMBOLS.NIFTY_REALTY} label="Realty" />
        <QuoteTile symbol={SYMBOLS.NIFTY_PSU_BANK} label="PSU Bank" />
      </div>

      {/* Global macro */}
      <div className="section-title">Global Macro</div>
      <div className="tile-grid">
        <QuoteTile symbol={SYMBOLS.USD_INR} label="USD / INR" dp={3} prefix="₹" />
        <QuoteTile symbol={SYMBOLS.US_10Y} label="US 10Y Yield" dp={3} />
        <QuoteTile symbol={SYMBOLS.DXY} label="Dollar Index" dp={2} />
        <QuoteTile symbol={SYMBOLS.BRENT} label="Brent Crude" dp={2} prefix="$" />
        <QuoteTile symbol={SYMBOLS.GOLD} label="Gold" dp={2} prefix="$" />
        <QuoteTile symbol={SYMBOLS.SPX} label="S&P 500" />
        <QuoteTile symbol={SYMBOLS.VIX_US} label="CBOE VIX" />
        <QuoteTile symbol={SYMBOLS.HANGSENG} label="Hang Seng" />
      </div>

      {/* Charts row */}
      <div className="main-grid">
        <HistoricalChart />
        <OptionChainPanel />
      </div>

      {/* FII/DII below */}
      <FiiDiiPanel />

      <footer className="foot">
        <em>Insights are analytical in nature and not guaranteed investment advice.</em>
        <br />
        Data: Yahoo Finance (live equity & macro, ~15 min delay) · NSE provisional (FII/DII,
        option chain) · Tiles refresh 30s · Charts 60s · Flows 5m
      </footer>
    </main>
  );
}
