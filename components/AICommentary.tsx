// components/AICommentary.tsx
"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AICommentary() {
  const { data, error } = useSWR("/api/commentary", fetcher, {
    refreshInterval: 30 * 60 * 1000, // 30 min
  });

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h2>Market Commentary</h2>
          <div className="sub">
            {data?.generatedAt
              ? `AI-generated · ${new Date(data.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })} IST`
              : "AI-generated institutional brief"}
          </div>
        </div>
      </div>

      {error ? (
        <div className="muted">Commentary unavailable.</div>
      ) : !data ? (
        <div>
          <div className="skel" style={{ height: 14, width: "100%", marginBottom: 8 }} />
          <div className="skel" style={{ height: 14, width: "95%", marginBottom: 8 }} />
          <div className="skel" style={{ height: 14, width: "92%", marginBottom: 8 }} />
          <div className="skel" style={{ height: 14, width: "70%" }} />
        </div>
      ) : !data.configured ? (
        <div className="warn">
          {data.message}
        </div>
      ) : data.error ? (
        <div className="muted">Commentary generation failed: {data.error}</div>
      ) : (
        <div className="commentary">
          {data.text.split("\n\n").map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
