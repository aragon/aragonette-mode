import { useForceChain } from "@/hooks/useForceChain";
import { PUB_CHAIN, PUB_REWARD_DISTRIBUTOR_CONTRACT } from "@/constants";
import { useState } from "react";
import { useTransactionManager } from "@/hooks/useTransactionManager";
import { useGetUserRewards } from "@/plugins/voting/hooks/useGetUserRewards";
import { RewardDistributorAbi } from "../artifacts/RewardDistributor.sol";
import { type Address } from "viem";

export function useClaimReward(token: string, onSuccess?: () => void, onError?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { forceChain } = useForceChain();

  const { data: userClaimMetadata } = useGetUserRewards();
  const claimMetadata = userClaimMetadata?.data.find((claim) => claim.token === token)?.claimMetadata;

  const { writeContract, isConfirming: isConfirming } = useTransactionManager({
    onSuccessMessage: "Claimed successfully",
    onSuccessDescription: "The transaction has been validated",
    onDeclineMessage: "Claimed declined",
    onDeclineDescription: "The transaction has been declined",
    onErrorMessage: "Could not claim",
    onSuccess() {
      setIsLoading(false);
      onSuccess?.();
    },
    onError() {
      setIsLoading(false);
      onError?.();
    },
  });

  const claimReward = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
      onError?.();
    }
  };

  return {
    claimReward,
    isConfirming: isLoading || isConfirming,
  };
}
