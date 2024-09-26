import { iVotesAbi } from "../artifacts/iVotes.sol";
import { PUB_CHAIN, MODE_TOKEN_CONTRACT } from "@/constants";
import { type Address } from "viem";
import { useReadContracts } from "wagmi";

/** Returns the delegate (if any) for the given address */
export const useTokenVotes = (address?: Address) => {
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        chainId: PUB_CHAIN.id,
        abi: iVotesAbi,
        functionName: "delegates",
        args: [address!],
        address: MODE_TOKEN_CONTRACT,
      },
      {
        chainId: PUB_CHAIN.id,
        abi: iVotesAbi,
        functionName: "getVotes",
        args: [address!],
        address: MODE_TOKEN_CONTRACT,
      },
      {
        chainId: PUB_CHAIN.id,
        abi: iVotesAbi,
        functionName: "balanceOf",
        args: [address!],
        address: MODE_TOKEN_CONTRACT,
      },
    ],
    query: { enabled: !!address },
  });

  return {
    delegatesTo: data?.[0].result,
    votingPower: data?.[1].result,
    balance: data?.[2].result,
    isLoading,
    isError,
    refetch,
  };
};
