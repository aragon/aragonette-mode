import { useForceChain } from "@/hooks/useForceChain";
import { PUB_CHAIN, PUB_REWARD_DISTRIBUTOR_CONTRACT } from "@/constants";
import { useCallback } from "react";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { useGetUserRewards } from "@/plugins/voting/hooks/useGetUserRewards";
import { RewardDistributorAbi } from "../artifacts/RewardDistributor.sol";
import { type Address } from "viem";

export function useClaimReward(token: string, onSuccess?: () => Promise<void> | void, onError?: () => void) {
  const { forceChain } = useForceChain();
  const { data: userClaimMetadata } = useGetUserRewards();

  const claimMetadata = userClaimMetadata?.data.find((claim) => claim.token === token)?.claimMetadata;

  const { writeContract, isConfirming: txConfirming } = useTransactionManager({
    onSuccessMessage: "Claimed successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Claimed declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not claim",
    onSuccess: onSuccess,
    onError: onError,
  });

  const claimReward = useCallback(async () => {
    try {
      await forceChain();
      if (!token) throw new Error("Amount is required");
      if (!claimMetadata) throw new Error("No claim metadata found");

      writeContract({
        chainId: PUB_CHAIN.id,
        abi: RewardDistributorAbi,
        address: PUB_REWARD_DISTRIBUTOR_CONTRACT,
        functionName: "claim",
        args: [
          [
            {
              identifier: claimMetadata.identifier as Address,
              account: claimMetadata.account as Address,
              amount: BigInt(claimMetadata.amount),
              merkleProof: claimMetadata.merkleProof as readonly Address[],
            },
          ],
        ],
      });
    } catch (err) {
      console.error(err);
      onError?.();
    }
  }, [token, claimMetadata, forceChain, writeContract, onError]);

  return {
    claimReward,
    isConfirming: txConfirming,
  };
}
