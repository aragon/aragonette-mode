import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useAccount, useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useOwnedTokens(token: Token) {
  const { address } = useAccount();
  const escrowContract = getEscrowContract(token);

  console.log("address", address);

  const { data: ownedTokens, isLoading } = useReadContract({
    address: escrowContract,
    abi: VotingEscrow,
    functionName: "ownedTokens",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  console.log("ownedTokens", ownedTokens);
  console.log("isLoading", isLoading);

  return {
    ownedTokens,
    isLoading,
  };
}
