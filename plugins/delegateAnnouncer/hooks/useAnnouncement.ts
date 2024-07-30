import { DelegationWallAbi } from "@/artifacts/DelegationWall.sol";
import { PUB_CHAIN, PUB_DELEGATION_CONTRACT_ADDRESS } from "@/constants";
import { type Address } from "viem";
import { useReadContract } from "wagmi";

export const useAnnouncement = (address: Address | undefined, options = {}) => {
  return useReadContract({
    chainId: PUB_CHAIN.id,
    abi: DelegationWallAbi,
    address: PUB_DELEGATION_CONTRACT_ADDRESS,
    functionName: "candidates",
    args: [address!],
    query: {
      enabled: !!address,
      refetchOnMount: true,
      staleTime: 0,
      ...options,
      select: (data) => (!data[0] || data[0] === "0x" ? undefined : data[0]),
    },
  });
};
