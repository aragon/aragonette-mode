import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_MULTISIG_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function useProposalConfirmation(proposalId = "", onSuccess?: () => void) {
  const { reload } = useRouter();
  const { addAlert } = useAlerts();
  const {
    writeContract: voteWrite,
    data: votingTxHash,
    error: votingError,
    status: confirmationStatus,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: votingTxHash });

  // Loading status and errors
  useEffect(() => {
    if (confirmationStatus === "idle" || confirmationStatus === "pending") return;
    else if (confirmationStatus === "error") {
      if (votingError?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        logger.error("Could not confirm the proposal", votingError);
        addAlert("Could not confirm the proposal", { type: "error" });
      }
      return;
    }

    // success
    if (!votingTxHash) return;
    else if (isConfirming) {
      addAlert("Confirmation submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: votingTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Confirmation registered", {
      description: "The transaction has been validated",
      type: "success",
      txHash: votingTxHash,
    });

    onSuccess ? onSuccess() : reload();
  }, [confirmationStatus, votingTxHash, isConfirming, isConfirmed]);

  const confirmProposal = () => {
    if (proposalId) {
      voteWrite({
        abi: MultisigAbi,
        address: PUB_MULTISIG_ADDRESS,
        functionName: "approve", // TODO: switch with confirm
        args: [BigInt(proposalId), false],
      });
    }
  };

  return {
    confirmProposal,
    confirmationStatus,
    isConfirming,
    isConfirmed,
  };
}
