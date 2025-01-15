import { useState } from "react";
import { erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract, getTokenContract } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useApproveToken(amount: bigint, token: Token, onSuccess?: () => void, onError?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useAccount();
  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);
  const tokenContract = getTokenContract(token);

  const { data: allowance } = useReadContract({
    address: tokenContract,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address!, escrowContract],
    query: {
      enabled: Boolean(address),
    },
  });

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

  const approveToken = async () => {
    setIsLoading(true);

    try {
      await forceChain();

      if (!address) throw new Error("No address found");

      if (allowance && allowance >= amount) {
        setIsLoading(false);
        return onSuccess?.();
      }

      writeContract({
        chain: PUB_CHAIN,
        abi: erc20Abi,
        address: tokenContract,
        functionName: "approve",
        args: [escrowContract, amount],
      });
    } catch (error) {
      setIsLoading(false);
      onError?.();
    }
  };

  return {
    approveToken,
    isConfirming: isLoading || isConfirming,
  };
}
