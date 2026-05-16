// lib/symbols.ts
// Yahoo Finance ticker mapping for Indian and global instruments

export const SYMBOLS = {
  // Indian indices
  NIFTY: "^NSEI",
  BANKNIFTY: "^NSEBANK",
  SENSEX: "^BSESN",
  INDIA_VIX: "^INDIAVIX",
  NIFTY_IT: "^CNXIT",
  NIFTY_AUTO: "^CNXAUTO",
  NIFTY_FMCG: "^CNXFMCG",
  NIFTY_PHARMA: "^CNXPHARMA",
  NIFTY_METAL: "^CNXMETAL",
  NIFTY_ENERGY: "^CNXENERGY",
  NIFTY_REALTY: "^CNXREALTY",
  NIFTY_PSU_BANK: "^CNXPSUBANK",
  NIFTY_FIN: "NIFTY_FIN_SERVICE.NS",

  // Currency
  USD_INR: "INR=X",

  // US / global
  US_10Y: "^TNX",       // 10-Year Treasury Yield
  US_2Y: "^FVX",        // 5-Year (proxy; ^IRX is 13-week)
  SPX: "^GSPC",
  NDX: "^IXIC",
  DOW: "^DJI",
  VIX_US: "^VIX",
  DXY: "DX-Y.NYB",      // US Dollar Index
  BRENT: "BZ=F",
  WTI: "CL=F",
  GOLD: "GC=F",

  // Asia
  NIKKEI: "^N225",
  HANGSENG: "^HSI",
  SHANGHAI: "000001.SS",
} as const;

export type SymbolKey = keyof typeof SYMBOLS;

// Display labels for the UI
export const LABELS: Record<SymbolKey, string> = {
  NIFTY: "Nifty 50",
  BANKNIFTY: "Bank Nifty",
  SENSEX: "Sensex",
  INDIA_VIX: "India VIX",
  NIFTY_IT: "Nifty IT",
  NIFTY_AUTO: "Nifty Auto",
  NIFTY_FMCG: "Nifty FMCG",
  NIFTY_PHARMA: "Nifty Pharma",
  NIFTY_METAL: "Nifty Metal",
  NIFTY_ENERGY: "Nifty Energy",
  NIFTY_REALTY: "Nifty Realty",
  NIFTY_PSU_BANK: "Nifty PSU Bank",
  NIFTY_FIN: "Nifty Financial",
  USD_INR: "USD / INR",
  US_10Y: "US 10Y Yield",
  US_2Y: "US 5Y Yield",
  SPX: "S&P 500",
  NDX: "Nasdaq",
  DOW: "Dow Jones",
  VIX_US: "CBOE VIX",
  DXY: "Dollar Index",
  BRENT: "Brent Crude",
  WTI: "WTI Crude",
  GOLD: "Gold",
  NIKKEI: "Nikkei 225",
  HANGSENG: "Hang Seng",
  SHANGHAI: "Shanghai Comp",
};
