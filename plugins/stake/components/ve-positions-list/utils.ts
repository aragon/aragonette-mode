import { EPOCH_DURATION } from "@/constants";
import { type VeTokenItem } from "./types";
import { Token } from "../../types/tokens";

export function epochsSince(timestamp: number, now: number): string {
  const diff = now - timestamp;
  if (diff < 0) return "-";

  const epochsRatio = diff / EPOCH_DURATION;
  return Math.ceil(epochsRatio).toString();
}

export function filterTokens(items: VeTokenItem[], filter: string) {
  if (!filter) return items;

  return items.filter((item) => {
    if (item.id.toString().includes(filter)) return true;
    else if (item.token === Token.MODE && "mode".includes(filter)) return true;
    else if (item.token === Token.BPT && "bpt".includes(filter)) return true;

    return false;
  });
}
