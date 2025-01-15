import { NumberFormat, formatterUtils } from "@aragon/ods";

export function compactNumber(input: number | string, decimalPlaces = 2): string {
  const num = typeof input === "string" ? Number.parseFloat(input) : input;

  if (Number.isNaN(num)) return "-";
  if (num === 0) return "0";

  if (num >= 1.0e12) {
    return `${(num / 1.0e9).toFixed(decimalPlaces)}T`;
  }
  if (num >= 1.0e9) {
    return `${(num / 1.0e9).toFixed(decimalPlaces)}B`;
  }
  if (num >= 1.0e6) {
    return `${(num / 1.0e6).toFixed(decimalPlaces)}M`;
  }
  if (num >= 1.0e3) {
    return `${(num / 1.0e3).toFixed(decimalPlaces)}K`;
  }
  if (num >= 1) {
    return num.toFixed(decimalPlaces);
  }
  if (num >= 1e-1) {
    return num.toFixed(Math.max(3, decimalPlaces));
  }
  if (num >= 1e-2) {
    return num.toFixed(Math.max(4, decimalPlaces));
  }
  if (num >= 1e-3) {
    return num.toFixed(Math.max(5, decimalPlaces));
  }
  if (num >= 1e-4) {
    return num.toFixed(Math.max(6, decimalPlaces));
  }
  if (num >= 1e-5) {
    return num.toFixed(Math.max(7, decimalPlaces));
  }
  return "~0.0";
}

export const formatRewards = (
  value: number | undefined | null,
  formatter: NumberFormat = NumberFormat.FIAT_TOTAL_SHORT
) => {
  if (!value) return "None";
  if (value === 0) return "$0.00";
  if (value < 0.01) return "< $0.01";
  return formatterUtils.formatNumber(value, { format: formatter });
};
