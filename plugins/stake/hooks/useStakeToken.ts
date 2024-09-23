import { VotingEscrow } from "@/artifacts/VotingEscrow.sol";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useApproveToken } from "./useApproveToken";
import { useState } from "react";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useStakeToken(token: Token, onSuccess?: () => void) {
  const { writeContract } = useTransactionManager({
    onSuccessMessage: "Staked successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Stake declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not stake",
    onErrorDescription: "The transaction could not be completed",
    onSuccess: onSuccess,
  });
  const [amount, setAmount] = useState<bigint>(0n);
  const { approveToken } = useApproveToken(token, () => {
    writeContract({
      chain: PUB_CHAIN,
      abi: VotingEscrow,
      address: escrowContract,
      functionName: "createLock",
      args: [amount],
    });
  });
  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);

  const stakeToken = (amount: bigint) => {
    if (!amount) return;
    forceChain({
      onSuccess: () => {
        setAmount(amount);
        approveToken(amount);
      },
    });
  };

  return {
    stakeToken,
  };
}
