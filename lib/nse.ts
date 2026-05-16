// lib/nse.ts
// Centralized NSE fetcher with cookie warm-up, retry, and in-memory cache.

const NSE_HOME = "https://www.nseindia.com";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.nseindia.com/",
};

// Module-level cookie jar — persists across requests within the same lambda
let cookieJar = "";
let cookieAt = 0;
const COOKIE_TTL = 10 * 60 * 1000; // 10 min

async function refreshCookies() {
  const res = await fetch(NSE_HOME, { headers: HEADERS, cache: "no-store" });
  const setCookie = res.headers.get("set-cookie") || "";
  cookieJar = setCookie;
  cookieAt = Date.now();
  return setCookie;
}

export async function fetchNSE(path: string, referer?: string) {
  // Warm cookies if stale
  if (!cookieJar || Date.now() - cookieAt > COOKIE_TTL) {
    await refreshCookies();
  }

  const url = path.startsWith("http") ? path : `${NSE_HOME}${path}`;
  const headers: any = { ...HEADERS, Cookie: cookieJar };
  if (referer) headers.Referer = referer;

  let res = await fetch(url, { headers, cache: "no-store" });

  // Retry once with fresh cookies on 401/403/429
  if ([401, 403, 429].includes(res.status)) {
    await refreshCookies();
    res = await fetch(url, {
      headers: { ...HEADERS, Cookie: cookieJar },
      cache: "no-store",
    });
  }

  if (!res.ok) throw new Error(`NSE ${url} -> ${res.status}`);
  return res.json();
}
