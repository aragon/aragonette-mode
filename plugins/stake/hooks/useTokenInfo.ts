import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useTokenInfo(token: Token, tokenId: bigint) {
  const escrowContract = getEscrowContract(token);

  const { data: tokenInfo, isFetched } = useReadContract({
    address: escrowContract,
    abi: VotingEscrow,
    functionName: "locked",
    args: [tokenId!],
    query: {
      enabled: !!tokenId,
    },
  });

  return {
    tokenInfo,
    isFetched,
  };
}
