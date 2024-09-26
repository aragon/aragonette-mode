import { PUB_USE_BLOCK_TIMESTAMP } from "@/constants";
import { useBlock } from "wagmi";

export function useNow() {
  const { data } = useBlock({
    query: {
      enabled: PUB_USE_BLOCK_TIMESTAMP,
    },
  });

  const realTimestamp = new Date().getTime();
  const timestamp = Number(data?.timestamp ?? 0n) * 1000;

  return {
    now: PUB_USE_BLOCK_TIMESTAMP && timestamp ? timestamp : realTimestamp,
  };
}
