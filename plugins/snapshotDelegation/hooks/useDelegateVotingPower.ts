import { SnapshotDelegationAbi } from "@/artifacts/SnapshotDelegation.sol";
import { PUB_SNAPSHOT_DELEGATION_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { getSnapshotDelegateSpace } from "@/services/rpc/snapshotDelegation";
import { useCallback, useEffect } from "react";
import { stringToBytes, toHex, type Address } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useDelegateVotingPower = (mode: "delegate" | "claim" = "delegate", onSuccess?: () => void) => {
  const { addAlert } = useAlerts();
  const { address: connectedAccount } = useAccount();
  const { writeContract, data: hash, error, status } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        logger.error(`Could not ${mode} voting power`, error);
        addAlert(`Could not ${mode} voting power`, { type: "error" });
      }
      return;
    }

    // success
    if (!hash) return;
    else if (isConfirming) {
      addAlert("Delegation submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: hash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Delegation registered", {
      description: "The transaction has been validated",
      type: "success",
      txHash: hash,
    });

    onSuccess?.();
  }, [status, hash, isConfirming, isConfirmed]);

  const delegateVotingPower = useCallback(
    async (delegate: Address | undefined) => {
      if (mode === "delegate" && delegate) {
        const spaceId = toHex(stringToBytes(SNAPSHOT_SPACE, { size: 32 }));
        writeContract({
          abi: SnapshotDelegationAbi,
          address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
          functionName: "setDelegate",
          args: [spaceId, delegate],
        });
      } else {
        const spaceId = await getSnapshotDelegateSpace(connectedAccount!);
        writeContract({
          abi: SnapshotDelegationAbi,
          address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
          functionName: "clearDelegate",
          args: [spaceId],
        });
      }
    },
    [connectedAccount, mode, writeContract]
  );

  return {
    delegateVotingPower,
    isConfirmed,
    isConfirming,
    status,
  };
};
