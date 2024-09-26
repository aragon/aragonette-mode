import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useForceChain } from "@/hooks/useForceChain";
import { useIsVoting } from "./useIsVoting";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { useApproveNFT } from "./useApproveNFT";

export function useBeginWithdrawal(token: Token, tokenId: bigint) {
  const { writeContract } = useTransactionManager({
    onSuccessMessage: "Started withdrawal successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Start withdrawal declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not start withdrawal",
    onErrorDescription: "The transaction could not be completed",
  });

  const { forceChain } = useForceChain();
  const { isVoting } = useIsVoting(token, tokenId);
  const escrowContract = getEscrowContract(token);

  const { approveNFT } = useApproveNFT(token, () => {
    writeContract({
      abi: VotingEscrow,
      address: escrowContract,
      functionName: isVoting ? "resetVotesAndBeginWithdrawal" : "beginWithdrawal",
      args: [tokenId],
    });
  });

  const beginWithdrawal = () => {
    forceChain({
      onSuccess: () => approveNFT(tokenId),
    });
  };

  return {
    beginWithdrawal,
  };
}
