import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract, getTokenContract } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useApproveToken(token: Token, onSuccess?: () => void, onError?: () => void) {
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
    onSuccess: onSuccess,
    onError: onError,
  });

  const approveToken = (amount: bigint) => {
    if (!address) return;

    forceChain({
      onSuccess: () => {
        writeContract({
          chain: PUB_CHAIN,
          abi: erc20Abi,
          address: tokenContract,
          functionName: "approve",
          args: [escrowContract, amount],
        });
      },
    });
  };

  return {
    approveToken,
    isConfirming,
  };
}
