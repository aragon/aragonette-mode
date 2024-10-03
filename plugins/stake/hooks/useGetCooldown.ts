import { ExitQueueAbi } from "@/artifacts/ExitQueue.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContracts } from "../hooks/useGetContract";

export function useGetCooldown(token: Token, tokenId: bigint) {
  const { data } = useGetContracts(token);

  const queueContract = data?.queueContract.result;

  const {
    data: cooldown,
    isLoading,
    queryKey,
  } = useReadContract({
    address: queueContract,
    abi: ExitQueueAbi,
    functionName: "queue",
    args: [tokenId],
    query: {
      enabled: !!queueContract,
    },
  });

  return {
    cooldown,
    isLoading,
    queryKey,
  };
}
