import { useState } from "react";
import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useForceChain } from "@/hooks/useForceChain";
import { useIsVoting } from "./useIsVoting";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { useApproveNFT } from "./useApproveNFT";

export function useBeginWithdrawal(token: Token, tokenId: bigint, onSuccess?: () => void, onError?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, isConfirming } = useTransactionManager({
    onSuccessMessage: "Started withdrawal successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Start withdrawal declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not start withdrawal",
    onErrorDescription: "The transaction could not be completed",
    onSuccess() {
      setIsLoading(false);
      onSuccess?.();
    },
    onError() {
      setIsLoading(false);
      onError?.();
    },
  });

  const { forceChain } = useForceChain();
  const { isVoting } = useIsVoting(token, tokenId);
  const escrowContract = getEscrowContract(token);

  const { approveNFT, isConfirming: isConfirming2 } = useApproveNFT(
    token,
    onTokensApproveSuccess,
    onTokensApproveError
  );

  function onTokensApproveSuccess() {
    writeContract({
      abi: VotingEscrow,
      address: escrowContract,
      functionName: isVoting ? "resetVotesAndBeginWithdrawal" : "beginWithdrawal",
      args: [tokenId],
    });
  }
  function onTokensApproveError() {
    setIsLoading(false);
    onError?.();
  }

  const beginWithdrawal = () => {
    setIsLoading(true);

    forceChain()
      .then(() => {
        approveNFT(tokenId);
      })
      .catch((err) => {
        setIsLoading(false);
        onError?.();
      });
  };

  return {
    beginWithdrawal,
    isConfirming: isLoading || isConfirming || isConfirming2,
  };
}
