import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useIsVoting(token: Token, tokenId: bigint) {
  const escrowContract = getEscrowContract(token);

  const {
    data: isVoting,
    isFetched,
    queryKey,
  } = useReadContract({
    address: escrowContract,
    abi: VotingEscrow,
    functionName: "isVoting",
    args: [tokenId],
  });

  return {
    isVoting,
    isFetched,
    queryKey,
  };
}
