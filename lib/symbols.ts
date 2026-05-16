// lib/symbols.ts
export const SYMBOLS = {
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
  USD_INR: "INR=X",
  US_10Y: "^TNX",
  SPX: "^GSPC",
  VIX_US: "^VIX",
  DXY: "DX-Y.NYB",
  BRENT: "BZ=F",
  GOLD: "GC=F",
  HANGSENG: "^HSI",
} as const;

// Sector indices for the heatmap
export const SECTOR_INDICES = [
  { key: SYMBOLS.NIFTY_IT, name: "IT" },
  { key: SYMBOLS.NIFTY_AUTO, name: "Auto" },
  { key: SYMBOLS.NIFTY_FMCG, name: "FMCG" },
  { key: SYMBOLS.NIFTY_PHARMA, name: "Pharma" },
  { key: SYMBOLS.NIFTY_METAL, name: "Metal" },
  { key: SYMBOLS.NIFTY_ENERGY, name: "Energy" },
  { key: SYMBOLS.NIFTY_REALTY, name: "Realty" },
  { key: SYMBOLS.NIFTY_PSU_BANK, name: "PSU Bank" },
  { key: SYMBOLS.BANKNIFTY, name: "Bank Nifty" },
];
