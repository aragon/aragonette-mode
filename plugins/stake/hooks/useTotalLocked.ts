import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useTotalLocked(token: Token) {
  const escrowContract = getEscrowContract(token);

  const {
    data: totalLocked,
    isFetched,
    queryKey,
  } = useReadContract({
    address: escrowContract,
    abi: VotingEscrow,
    functionName: "totalLocked",
    args: [],
  });

  return {
    totalLocked,
    isFetched,
    queryKey,
  };
}
