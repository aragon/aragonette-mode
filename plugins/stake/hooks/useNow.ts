import { PUB_USE_BLOCK_TIMESTAMP } from "@/constants";
import { type DateFormat, formatterUtils } from "@aragon/ods";
import { useEffect, useState } from "react";
import { useBlock } from "wagmi";

export function useNow() {
  const [realTimestamp, setTimestamp] = useState(Date.now());
  const { data } = useBlock({
    query: {
      enabled: PUB_USE_BLOCK_TIMESTAMP,
    },
  });

  const blockTimestamp = Number(data?.timestamp ?? 0n) * 1000;
  useEffect(() => {
    setTimestamp(PUB_USE_BLOCK_TIMESTAMP && blockTimestamp ? blockTimestamp : Date.now());
  }, [blockTimestamp]);

  const getRelativeTime = (timestamp: number, format: DateFormat) => {
    const diffTime = realTimestamp - Date.now();
    return formatterUtils.formatDate(timestamp - diffTime, {
      format,
    });
  };

  return {
    now: realTimestamp,
    getRelativeTime,
  };
}
