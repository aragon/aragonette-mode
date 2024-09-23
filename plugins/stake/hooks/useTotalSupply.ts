import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useTotalSupply(token: Token) {
  const escrowContract = getEscrowContract(token);

  const {
    data: totalSupply,
    isFetched,
    queryKey,
  } = useReadContract({
    address: escrowContract,
    abi: VotingEscrow,
    functionName: "totalSupply",
    args: [],
  });

  return {
    totalSupply,
    isFetched,
    queryKey,
  };
}
