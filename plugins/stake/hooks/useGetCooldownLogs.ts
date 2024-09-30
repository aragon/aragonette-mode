import { useAccount, usePublicClient } from "wagmi";
import { type Token } from "../types/tokens";
import { getAbiItem } from "viem";
import { ExitQueueAbi } from "@/artifacts/ExitQueue.sol";
import { useQuery } from "wagmi/query";
import { useGetContracts } from "./useGetContract";

export function useGetCooldownLogs(token: Token) {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { data } = useGetContracts(token);

  const queueContract = data?.queueContract.result;

  const ExitQueueEvent = getAbiItem({
    abi: ExitQueueAbi,
    name: "ExitQueued",
  });

  return useQuery({
    queryKey: ["exitQueue", address ?? ""],
    enabled: !!queueContract && !!address,
    queryFn: () =>
      publicClient?.getLogs({
        address: queueContract,
        event: ExitQueueEvent,
        args: { holder: address! },
        fromBlock: "earliest",
        toBlock: "latest",
      }),
  });
}
