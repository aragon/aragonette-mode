import { useState } from "react";
import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract, getTokenContract } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useApproveToken(token: Token, onSuccess?: () => void, onError?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useAccount();
  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);
  const tokenContract = getTokenContract(token);

  const { writeContract, isConfirming } = useTransactionManager({
    onSuccessMessage: "Approved successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Approval declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not approve",
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

  const approveToken = (amount: bigint) => {
    if (!address) return;
    setIsLoading(true);

    forceChain()
      .then(() => {
        writeContract({
          chain: PUB_CHAIN,
          abi: erc20Abi,
          address: tokenContract,
          functionName: "approve",
          args: [escrowContract, amount],
        });
      })
      .catch((err) => {
        setIsLoading(false);
        onError?.();
      });
  };

  return {
    approveToken,
    isConfirming: isLoading || isConfirming,
  };
}
