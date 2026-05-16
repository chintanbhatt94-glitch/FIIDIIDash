// components/SentimentDial.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SentimentDial() {
  const { data, error } = useSWR("/api/sentiment", fetcher, { refreshInterval: 5 * 60 * 1000 });

  return (
    <div className="card sentiment-card">
      <div className="card-head" style={{ marginBottom: 0, paddingBottom: 12 }}>
        <div>
          <h2>Market Sentiment</h2>
          <div className="sub">Broad-market reading · Nifty</div>
        </div>
      </div>

      {error ? (
        <div className="muted">Sentiment unavailable.</div>
      ) : !data ? (
        <div className="skel" style={{ height: 60 }} />
      ) : (
        <>
          <div className={`sentiment-label-big ${data.color}`}>
            {data.label}
          </div>
          <ul className="sentiment-reasoning">
            {(data.reasoning || []).map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="text-xs faint" style={{ fontStyle: "italic", marginTop: 4 }}>
            {data.disclaimer}
          </div>
        </>
      )}
    </div>
  );
}
