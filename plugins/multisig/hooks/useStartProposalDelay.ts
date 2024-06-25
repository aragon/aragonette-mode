import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_MULTISIG_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { type SecondaryMetadata } from "@/features/proposals/providers/multisig/types";
import { logger } from "@/services/logger";
import { uploadToPinata } from "@/services/ipfs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toHex } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function useAdvanceToNextStage(
  proposalId: string | undefined,
  secondaryMetadata: SecondaryMetadata | undefined,
  onSuccess?: () => void
) {
  const { reload } = useRouter();
  const { addAlert } = useAlerts();
  const {
    writeContract: startDelay,
    data: advanceTxHash,
    error: advanceError,
    status: advanceStatus,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: advanceTxHash });

  // Loading status and errors
  useEffect(() => {
    if (advanceStatus === "idle" || advanceStatus === "pending") return;
    else if (advanceStatus === "error") {
      if (advanceError?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        logger.error("Could not advance the proposal to next stage", advanceError);
        addAlert("Could not advance the proposal to next stage", { type: "error" });
      }
      return;
    }

    // success
    if (!advanceTxHash) return;
    else if (isConfirming) {
      addAlert("Transaction submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: advanceTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Proposal advanced to next stage", {
      description: "The transaction has been validated",
      type: "success",
      txHash: advanceTxHash,
    });

    onSuccess ? onSuccess() : reload();
  }, [advanceStatus, advanceTxHash, isConfirming, isConfirmed]);

  const advanceToNextStage = async () => {
    if (!proposalId || !secondaryMetadata) return;

    try {
      const ipfsUrl = await uploadToPinata(secondaryMetadata);

      if (ipfsUrl) {
        startDelay({
          abi: MultisigAbi,
          address: PUB_MULTISIG_ADDRESS,
          functionName: "startProposalDelay",
          args: [BigInt(proposalId), toHex(ipfsUrl)],
        });
      }
    } catch (error) {
      logger.error("Could not upload secondary metadata to IPFS", error);
    }
  };

  return {
    advanceToNextStage,
    advanceStatus,
    isConfirming,
    isConfirmed,
  };
}
