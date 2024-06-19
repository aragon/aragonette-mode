import { DelegationWallAbi } from "@/artifacts/DelegationWall.sol";
import { PUB_DELEGATION_CONTRACT_ADDRESS } from "@/constants";
import { useMetadata } from "@/hooks/useMetadata";
import { type Address } from "viem";
import { useReadContract } from "wagmi";
import { type IDelegationWallMetadata } from "../utils/types";

export const useAnnouncement = (address: Address | undefined, options = {}) => {
  const { data, queryKey } = useReadContract({
    abi: DelegationWallAbi,
    address: PUB_DELEGATION_CONTRACT_ADDRESS,
    functionName: "candidates",
    args: [address!],
    query: { enabled: !!address, refetchOnMount: true, staleTime: 0, ...options },
  });

  return { ...useMetadata<IDelegationWallMetadata>(data?.[0]), queryKey };
};
