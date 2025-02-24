import { useState } from "react";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract, useGetContracts } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { LockAbi } from "@/artifacts/Lock.sol";
import { useReadContract } from "wagmi";
import { erc721Abi } from "viem";

export function useApproveNFT(token: Token, tokenId: bigint, onSuccess?: () => void, onError?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);
  const { data } = useGetContracts(token);

  const lockNFTContract = data?.lockNFTContract.result;

  const { data: approvedOperator } = useReadContract({
    address: lockNFTContract,
    abi: erc721Abi,
    functionName: "getApproved",
    args: [tokenId],
    query: {
      enabled: Boolean(lockNFTContract),
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

  const approveNFT = async () => {
    setIsLoading(true);

    try {
      await forceChain();
      if (!lockNFTContract) {
        throw new Error("Lock NFT contract not initialized");
      }

      if (approvedOperator === escrowContract) {
        setIsLoading(false);
        return onSuccess?.();
      }

      writeContract({
        chain: PUB_CHAIN,
        abi: LockAbi,
        address: lockNFTContract,
        functionName: "approve",
        args: [escrowContract, tokenId],
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      onError?.();
    }
  };

  return {
    approveNFT,
    isConfirming: isLoading || isConfirming,
  };
}
