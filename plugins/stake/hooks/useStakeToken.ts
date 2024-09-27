import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useApproveToken } from "./useApproveToken";
import { useState } from "react";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useStakeToken(token: Token, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, isConfirming: isConfirming1 } = useTransactionManager({
    onSuccessMessage: "Staked successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Stake declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not stake",
    onErrorDescription: "The transaction could not be completed",
    onSuccess() {
      setIsLoading(false);
      onSuccess?.();
    },
    onError() {
      setIsLoading(false);
    },
  });
  const [amount, setAmount] = useState<bigint>(0n);
  const { approveToken, isConfirming: isConfirming2 } = useApproveToken(
    token,
    onTokenApproveSuccess,
    onTokenApproveError
  );
  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);

  function onTokenApproveSuccess() {
    writeContract({
      chain: PUB_CHAIN,
      abi: VotingEscrow,
      address: escrowContract,
      functionName: "createLock",
      args: [amount],
    });
  }

  function onTokenApproveError() {
    setIsLoading(false);
  }

  const stakeToken = (amount: bigint) => {
    if (!amount) return;
    setIsLoading(true);

    forceChain({
      onSuccess: () => {
        setAmount(amount);
        approveToken(amount);
      },
      onError() {
        setIsLoading(false);
      },
    });
  };

  return {
    stakeToken,
    isConfirming: isLoading || isConfirming1 || isConfirming2,
  };
}
