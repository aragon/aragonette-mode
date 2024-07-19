import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_CHAIN, PUB_MULTISIG_ADDRESS } from "@/constants";
import { useAlerts } from "@/context/Alerts";
import { type IProposalResource } from "@/features/proposals";
import { uploadToPinata } from "@/services/ipfs";
import { logger } from "@/services/logger";
import { getPlainText } from "@/utils/html";
import { title } from "process";
import { useEffect } from "react";
import { toHex } from "viem";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

export const useCreateProposal = () => {
  const { addAlert } = useAlerts();
  const { writeContract: createProposalWrite, data: createTxHash, status, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: createTxHash });

  useEffect(() => {
    if (status === "idle" || status === "pending") return;
    else if (status === "error") {
      if (error?.message?.startsWith("User rejected the request")) {
        addAlert("Transaction rejected by the user", {
          timeout: 4 * 1000,
        });
      } else {
        logger.error("Could not create the proposal", error);
        addAlert("Could not create the proposal", { type: "error" });
      }
      return;
    }

    // success
    if (!createTxHash) return;
    else if (isConfirming) {
      addAlert("Proposal submitted", {
        description: "Waiting for the transaction to be validated",
        txHash: createTxHash,
      });
      return;
    } else if (!isConfirmed) return;

    addAlert("Proposal created", {
      description: "The transaction has been validated",
      type: "success",
      txHash: createTxHash,
    });

    // setTimeout(() => {
    //   push("#/");
    // }, 1000 * 2);
  }, [status, createTxHash, isConfirming, isConfirmed]);

  interface ICreateProposalParams {
    metadata: {
      title: string;
      summary: string;
      type: string;
      description?: string;
      resources: Array<{
        name: string;
        url: string;
      }>;
    };
    emergency: boolean;
    startDate: number;
    endDate: number;
  }

  const submitProposal = async (proposalCreationParams: ICreateProposalParams) => {
    // Check metadata

    // Check the action
    // switch (actionType) {
    //   case ActionType.Signaling:
    //     break;
    //   case ActionType.Withdrawal:
    //     if (!actions.length) {
    //       return addAlert("Invalid proposal details", {
    //         description: "Please ensure that the withdrawal address and the amount to transfer are valid",
    //         type: "error",
    //       });
    //     }
    //     break;
    //   default:
    //     if (!actions.length || !actions[0].data || actions[0].data === "0x") {
    //       return addAlert("Invalid proposal details", {
    //         description: "Please ensure that the values of the action to execute are complete and correct",
    //         type: "error",
    //       });
    //     }
    // }

    const ipfsPin = await uploadToPinata(proposalCreationParams.metadata);

    createProposalWrite({
      chainId: PUB_CHAIN.id,
      abi: MultisigAbi,
      address: PUB_MULTISIG_ADDRESS,
      functionName: "createProposal",
      args: [
        toHex(ipfsPin),
        [],
        BigInt(0),
        false,
        BigInt(proposalCreationParams.startDate),
        BigInt(proposalCreationParams.endDate),
        proposalCreationParams.emergency,
      ],
    });
  };

  return { submitProposal };
};
