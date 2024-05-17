import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_MULTISIG_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function useProposalApproval(proposalId = "") {
  const { reload } = useRouter();
  const { addAlert } = useAlerts();
  const {
    writeContract: voteWrite,
    data: votingTxHash,
    error: votingError,
    status: approvalStatus,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: votingTxHash });

  // Loading status and errors
  useEffect(() => {
    if (approvalStatus === "idle" || approvalStatus === "pending") return;
    else if (approvalStatus === "error") {
      if (votingError?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        logger.error("Could not approve the proposal", votingError);
        addAlert("Could not approve the proposal", { type: "error" });
      }
      return;
    }

    // success
    if (!votingTxHash) return;
    else if (isConfirming) {
      addAlert("Approval submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: votingTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Approval registered", {
      description: "The transaction has been validated",
      type: "success",
      txHash: votingTxHash,
    });

    reload();
  }, [approvalStatus, votingTxHash, isConfirming, isConfirmed]);

  const approveProposal = () => {
    if (proposalId) {
      voteWrite({
        abi: MultisigAbi,
        address: PUB_MULTISIG_ADDRESS,
        functionName: "approve",
        args: [BigInt(proposalId), false],
      });
    }
  };

  return {
    approveProposal,
    approvalStatus,
    isConfirming,
    isConfirmed,
  };
}
