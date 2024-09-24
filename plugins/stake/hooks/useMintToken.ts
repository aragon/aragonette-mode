import { erc20Abi } from "viem";
import { useAccount } from "wagmi";
import { useForceChain } from "@/hooks/useForceChain";
import { type Token } from "../types/tokens";
import { getEscrowContract, getTokenContract } from "./useGetContract";
import { PUB_CHAIN } from "@/constants";
import { useTransactionManager } from "@/hooks/useTransactionManager";

export function useMintToken(token: Token, onSuccess?: () => void) {
  const { address } = useAccount();
  const { forceChain } = useForceChain();
  const escrowContract = getEscrowContract(token);
  const tokenContract = getTokenContract(token);

  const { writeContract } = useTransactionManager({
    onSuccessMessage: "Minted successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Mint declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not mint",
    onErrorDescription: "The transaction could not be completed",
    onSuccess: onSuccess,
  });

  const mintToken = (amount: bigint) => {
    if (!address) return;
    forceChain({
      onSuccess: () => {
        writeContract({
          chain: PUB_CHAIN,
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              name: "mint",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          address: tokenContract,
          functionName: "mint",
          args: [address, amount],
        });
      },
    });
  };

  return {
    mintToken,
  };
}
