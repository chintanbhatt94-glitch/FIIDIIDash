// components/TermsModal.tsx
"use client";
import { useEffect, useState } from "react";

const KEY = "imt-terms-accepted-v1";

export default function TermsModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const accepted = localStorage.getItem(KEY);
      if (!accepted) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try { localStorage.setItem(KEY, new Date().toISOString()); } catch {}
    setShow(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>Terms of Use</h2>
        <p>
          This dashboard provides general market information, analytical commentary,
          and data visualizations for educational and informational purposes only.
        </p>
        <p>
          <strong>This is not investment advice.</strong> The publisher is not a
          SEBI-registered Investment Adviser or Research Analyst. Nothing on this
          dashboard constitutes a recommendation to buy, sell, or hold any security.
        </p>
        <p>
          Market data is sourced from public APIs (Yahoo Finance, NSE) and may be
          delayed by 15 minutes or more. AI-generated commentary is descriptive,
          not prescriptive. Past performance is not indicative of future results.
        </p>
        <p>
          Consult a SEBI-registered investment adviser before making any
          investment decision. By proceeding, you acknowledge these terms.
        </p>
        <button className="accept-btn" onClick={accept}>
          I Understand · Continue
        </button>
      </div>
    </div>
  );
}
