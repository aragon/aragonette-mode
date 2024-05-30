import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_MULTISIG_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { logger } from "@/services/logger";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toHex } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function useAdvanceToNextStage(
  proposalId: string | undefined,
  secondaryMetadata: string,
  onSuccess?: () => void
) {
  const { reload } = useRouter();
  const { addAlert } = useAlerts();
  const {
    writeContract: advance,
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

    // TODO: pin secondary metadata to IPFS
    const ipfsCid = "bafkreigs2fc7r4zmuqex3j4voqi5llk6ke2sl3ggsngr3agmf5pe7yo24a";
    const ipfsUrl = `ipfs://${ipfsCid}`;

    // advance
    advance({
      abi: MultisigAbi,
      address: PUB_MULTISIG_ADDRESS,
      functionName: "startProposalDelay",
      args: [BigInt(proposalId), toHex(ipfsUrl)],
    });
  };

  return {
    advanceToNextStage,
    advanceStatus,
    isConfirming,
    isConfirmed,
  };
}
