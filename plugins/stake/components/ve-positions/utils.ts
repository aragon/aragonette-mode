import { EPOCH_DURATION } from "@/constants";
import { type VeTokenItem } from "./types";

export function epochsSince(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 0) return "-";

  const epochsRatio = diff / EPOCH_DURATION;
  return Math.ceil(epochsRatio).toString();
}

export function getVisibleTokens(items: VeTokenItem[], filter: string) {
  if (!filter) return items;

  return items.filter((item) => {
    if (item.id.includes(filter)) return true;
    else if (item.amount.toString().includes(filter)) return true;

    return false;
  });
}
