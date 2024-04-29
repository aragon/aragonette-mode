import { fetchJsonFromIpfs } from "@/utils/ipfs";
import { readContract, getPublicClient } from "@wagmi/core";
import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { config } from "@/context/Web3Modal";
import { type Address, fromHex, type Hex, getAbiItem } from "viem";
import { type Action } from "@/utils/types";
import { ProposalStages } from "@/features/proposals/services/proposal/domain";
import {
  type ProposalCreatedLogResponse,
  type Metadata,
  type ProposalParameters,
  type MultisigProposal,
} from "./types";
import { type ProposalStatus } from "@aragon/ods";
import { type ProposalStage } from "@/features/proposals/providers/utils/types";
import { PUB_CHAIN } from "@/constants";
import { logger } from "@/services/logger";

const getNumProposals = async function (chain: number, contractAddress: Address) {
  return await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "proposalCount",
  });
};

const getProposalData = async function (chain: number, contractAddress: Address, proposalId: bigint) {
  return await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "getProposal",
    args: [proposalId],
  }).then((data) => decodeProposalResultData(data as any));
};

const getProposalCreationData = async function (
  chain: number,
  contractAddress: Address,
  proposalId: bigint,
  snapshotBlock: bigint,
  startDate: bigint
) {
  const publicClient = getPublicClient(config);

  const ProposalCreatedEvent = getAbiItem({
    abi: MultisigAbi,
    name: "ProposalCreated",
  });

  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ProposalCreatedEvent as any,
      args: {
        proposalId,
      } as any,
      fromBlock: snapshotBlock,
      toBlock: startDate,
    })
    .then((logs) => {
      if (!logs?.length) throw new Error("No creation logs");
      const log = logs[0] as any;
      const tx = log.transactionHash;
      const block = log.blockNumber;

      const logData: ProposalCreatedLogResponse = log as any;

      return { metadata: logData.args.metadata, creator: logData.args.creator, tx, block };
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  return logs;
};

const getProposalBindings = async function (metadata: Metadata) {
  const githubLink = metadata.resources.find((resource) => resource.name === "GITHUB");
  const snapshotLink = metadata.resources.find((resource) => resource.name === "SNAPSHOT");

  const githubFileName = githubLink?.url.split("/").pop();
  const snapshotId = snapshotLink?.url.split("/").pop();

  return {
    githubId: githubFileName,
    snapshotId,
  };
};

export function parseMultisigData(proposals?: MultisigProposal[]): ProposalStage[] {
  if (!proposals) return [];

  return proposals.map((proposal) => {
    const bindings = [];

    if (proposal.githubId) {
      bindings.push({
        id: ProposalStages.DRAFT,
        link: proposal.githubId,
      });
    }

    if (proposal.snapshotId) {
      bindings.push({
        id: ProposalStages.COMMUNITY_VOTING,
        link: proposal.snapshotId,
      });
    }

    const voting = proposal.voting && {
      startDate: proposal.voting.startDate,
      endDate: proposal.voting.endDate,
      approvals: proposal.voting.approvals,
      quorum: proposal.voting.quorum,
      snapshotBlock: proposal.voting.snapshotBlock,
      choices: ["approve"],
      scores: [
        {
          choice: "approve",
          votes: proposal.voting.approvals,
          percentage: (proposal.voting.approvals / proposal.voting.quorum) * 100,
        },
      ],
      total_votes: proposal.voting.approvals,
    };

    const creator = [
      {
        link: `${PUB_CHAIN.blockExplorers?.default.url}/address/${proposal.creator}`,
        address: proposal.creator,
      },
    ];

    return {
      id: proposal.id,
      title: proposal.title,
      description: proposal.summary,
      body: proposal.description,
      status: proposal.status,
      //TODO: Get the emergency status from the contract
      isEmergency: false,
      creator,
      link: proposal.link,
      voting,
      actions: proposal.actions,
      bindings,
    };
  });
}

export const requestProposalData = async function (chain: number, contractAddress: Address) {
  const numProposals = await getNumProposals(chain, contractAddress);

  const proposals: MultisigProposal[] = [];

  for (let i = 0; i < numProposals; i++) {
    const proposalData = await getProposalData(chain, contractAddress, BigInt(i));

    if (proposalData) {
      const creationData = await getProposalCreationData(
        chain,
        contractAddress,
        BigInt(i),
        proposalData.parameters.snapshotBlock,
        proposalData.parameters.startDate
      );

      if (!creationData) return;

      const metadataCid = fromHex(creationData.metadata as Hex, "string");

      //TODO: Use IPFS hash from proposalData instead of logs
      const metadata = (await fetchJsonFromIpfs(metadataCid)) as Metadata;

      const { githubId, snapshotId } = await getProposalBindings(metadata);

      // by default an onchain proposal must have a council approval stage
      const baseProposalData = {
        title: metadata.title,
        summary: metadata.summary,
        description: metadata.description,
        creator: creationData.creator,
        link: `${PUB_CHAIN.blockExplorers?.default.url}/tx/${creationData.tx}`,
        actions: proposalData.actions,
        githubId,
        snapshotId,
      };

      const approvalStatus = computeApprovalStatus({
        startDate: proposalData.parameters.startDate,
        endDate: proposalData.parameters.endDate,
        executed: proposalData.executed,
        approvals: proposalData.approvals,
        minApprovals: proposalData.parameters.minApprovals,
      });

      proposals.push({
        ...baseProposalData,
        id: ProposalStages.COUNCIL_APPROVAL,
        status: approvalStatus,
        voting: {
          startDate: proposalData.parameters.startDate.toString(),
          endDate: proposalData.parameters.endDate.toString(),
          approvals: proposalData.approvals,
          quorum: proposalData.parameters.minApprovals,
          snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
        },
      });

      // generate confirmation stage if the proposal has been approved by the council
      // and after the time lock period has passed
      if (
        proposalData.approvals >= proposalData.parameters.minApprovals &&
        proposalData.firstDelayStartBlock &&
        proposalData.parameters.delayDuration &&
        proposalData.firstDelayStartBlock + proposalData.parameters.delayDuration >
          BigInt(Math.floor(Date.now() / 1000))
      ) {
        const confirmationStatus = computeConfirmationStatus({
          startDate: proposalData.parameters.startDate,
          endDate: proposalData.parameters.endDate,
          executed: proposalData.executed,
          confirmations: proposalData.confirmations,
          minApprovals: proposalData.parameters.minApprovals,
          isSignaling: proposalData.actions.length === 0,
        });

        proposals.push({
          ...baseProposalData,
          id: ProposalStages.COUNCIL_CONFIRMATION,
          status: confirmationStatus,
          voting: {
            startDate: proposalData.firstDelayStartBlock.toString(),
            endDate: proposalData.parameters.endDate.toString(),
            approvals: proposalData.confirmations,
            quorum: proposalData.parameters.minApprovals,
            snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
          },
        });
      }
    }
  }

  return proposals;
};

// Helpers
type ProposalData = {
  active: boolean;
  approvals: number;
  parameters: ProposalParameters;
  actions: Array<Action>;
  allowFailureMap: bigint;
  executed: boolean;

  // new multisig data
  firstDelayStartBlock: bigint | null;
  confirmations: number;
};

function decodeProposalResultData(data?: Array<any>): ProposalData | null {
  if (!data?.length || data.length != 5) return null;

  return {
    active: data[0] as boolean,
    approvals: data[1] as number,
    parameters: data[2] as ProposalParameters,
    actions: data[3] as Array<Action>,
    allowFailureMap: data[4] as bigint,

    // new multisig data
    firstDelayStartBlock: null,
    executed: false,
    confirmations: 0,
  };
}

interface IComputeApprovalStatus {
  startDate: bigint;
  endDate: bigint;
  executed: boolean;
  approvals: number;
  minApprovals: number;
}

function computeApprovalStatus({
  startDate,
  endDate,
  executed,
  approvals,
  minApprovals,
}: IComputeApprovalStatus): ProposalStatus {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const approvalsReached = approvals >= minApprovals;

  if (executed) {
    return "executed";
  }

  if (startDate > now) {
    return "pending";
  }

  // proposal is within time boundaries
  if (now <= endDate) {
    if (approvalsReached) {
      return "queued"; // THIS IS QUEUED FOR NEXT STAGE
    }
    return "active";
  }

  // proposal end date has passed
  return "rejected";
}

interface IComputeConfirmationStatus {
  startDate: bigint;
  endDate: bigint;
  executed: boolean;
  confirmations: number;
  minApprovals: number;
  isSignaling: boolean;
}
function computeConfirmationStatus({
  startDate,
  endDate,
  executed,
  confirmations,
  minApprovals,
  isSignaling,
}: IComputeConfirmationStatus): ProposalStatus {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const confirmationsReached = confirmations >= minApprovals;

  if (executed) {
    return "executed";
  }

  if (startDate > now) {
    return "pending";
  }

  if (now <= endDate) {
    if (confirmationsReached) {
      return isSignaling ? "accepted" : "queued";
    }

    return "active";
  }

  // proposal end date has passed
  if (!confirmationsReached) {
    return "rejected";
  }

  return isSignaling ? "accepted" : "expired";
}
