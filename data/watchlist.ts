// data/watchlist.ts
// Edit this list to customize your watchlist.
// For NSE stocks, append ".NS" to the symbol (Yahoo Finance convention).
// Examples:
//   "RELIANCE.NS"   = Reliance Industries
//   "TCS.NS"        = TCS
//   "HDFCBANK.NS"   = HDFC Bank

export const WATCHLIST: { symbol: string; label: string }[] = [
  { symbol: "RELIANCE.NS", label: "Reliance" },
  { symbol: "HDFCBANK.NS", label: "HDFC Bank" },
  { symbol: "TCS.NS", label: "TCS" },
  { symbol: "INFY.NS", label: "Infosys" },
  { symbol: "ICICIBANK.NS", label: "ICICI Bank" },
  { symbol: "ITC.NS", label: "ITC" },
  { symbol: "LT.NS", label: "L&T" },
  { symbol: "SBIN.NS", label: "SBI" },
  { symbol: "BAJFINANCE.NS", label: "Bajaj Finance" },
  { symbol: "BHARTIARTL.NS", label: "Bharti Airtel" },
  { symbol: "KOTAKBANK.NS", label: "Kotak Bank" },
  { symbol: "AXISBANK.NS", label: "Axis Bank" },
];

// 20 highest FII-holding large caps (refresh quarterly from BSE shareholding filings)
// Static snapshot — last updated reflects most recent quarterly disclosures
export const FII_FAVORITES: { symbol: string; label: string }[] = [
  { symbol: "HDFCBANK.NS", label: "HDFC Bank" },
  { symbol: "ICICIBANK.NS", label: "ICICI Bank" },
  { symbol: "RELIANCE.NS", label: "Reliance" },
  { symbol: "INFY.NS", label: "Infosys" },
  { symbol: "TCS.NS", label: "TCS" },
  { symbol: "AXISBANK.NS", label: "Axis Bank" },
  { symbol: "KOTAKBANK.NS", label: "Kotak Bank" },
  { symbol: "BHARTIARTL.NS", label: "Bharti Airtel" },
  { symbol: "LT.NS", label: "L&T" },
  { symbol: "BAJFINANCE.NS", label: "Bajaj Finance" },
  { symbol: "MARUTI.NS", label: "Maruti Suzuki" },
  { symbol: "ASIANPAINT.NS", label: "Asian Paints" },
  { symbol: "HCLTECH.NS", label: "HCL Tech" },
  { symbol: "SUNPHARMA.NS", label: "Sun Pharma" },
  { symbol: "TITAN.NS", label: "Titan" },
  { symbol: "ULTRACEMCO.NS", label: "UltraTech" },
  { symbol: "WIPRO.NS", label: "Wipro" },
  { symbol: "M&M.NS", label: "M&M" },
  { symbol: "ADANIENT.NS", label: "Adani Enterprises" },
  { symbol: "TECHM.NS", label: "Tech Mahindra" },
];

// Nifty 500 universe for gainers/losers/active scans
// Subset of liquid large-caps — full Nifty 500 would be heavier on API quotas
export const NIFTY_LARGE_CAPS: string[] = [
  "RELIANCE.NS", "HDFCBANK.NS", "TCS.NS", "BHARTIARTL.NS", "ICICIBANK.NS",
  "INFY.NS", "SBIN.NS", "BAJFINANCE.NS", "HINDUNILVR.NS", "ITC.NS",
  "LT.NS", "KOTAKBANK.NS", "HCLTECH.NS", "SUNPHARMA.NS", "MARUTI.NS",
  "AXISBANK.NS", "M&M.NS", "ULTRACEMCO.NS", "WIPRO.NS", "ADANIENT.NS",
  "ASIANPAINT.NS", "TITAN.NS", "NESTLEIND.NS", "BAJAJFINSV.NS", "POWERGRID.NS",
  "NTPC.NS", "TECHM.NS", "ONGC.NS", "JSWSTEEL.NS", "TATAMOTORS.NS",
  "COALINDIA.NS", "ADANIPORTS.NS", "HINDALCO.NS", "GRASIM.NS", "BRITANNIA.NS",
  "EICHERMOT.NS", "HEROMOTOCO.NS", "BPCL.NS", "DIVISLAB.NS", "DRREDDY.NS",
  "CIPLA.NS", "TATACONSUM.NS", "INDUSINDBK.NS", "APOLLOHOSP.NS", "BAJAJ-AUTO.NS",
  "TATASTEEL.NS", "SHRIRAMFIN.NS", "SBILIFE.NS", "HDFCLIFE.NS", "LTIM.NS",
];
