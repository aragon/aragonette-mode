import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useAccount, useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useOwnedTokens(token: Token, enabled: boolean = true) {
  const { address } = useAccount();
  const escrowContract = getEscrowContract(token);

  const {
    data: ownedTokens,
    isLoading,
    queryKey,
  } = useReadContract({
    address: escrowContract,
    abi: VotingEscrow,
    functionName: "ownedTokens",
    args: [address!],
    query: {
      enabled: !!address && enabled,
    },
  });

  return {
    ownedTokens,
    isLoading,
    queryKey,
  };
}
