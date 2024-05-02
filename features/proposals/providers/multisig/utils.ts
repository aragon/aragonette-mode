import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_CHAIN } from "@/constants";
import { config } from "@/context/Web3Modal";
import { type ProposalStage } from "@/features/proposals/providers/utils/types";
import { ProposalStages, type ProposalStatus } from "@/features/proposals/services/proposal/domain";
import { logger } from "@/services/logger";
import { fetchJsonFromIpfs } from "@/utils/ipfs";
import { type Action } from "@/utils/types";
import { getPublicClient, readContract } from "@wagmi/core";
import { fromHex, getAbiItem, type Address, type Hex } from "viem";
import {
  type Metadata,
  type MultisigProposal,
  type ProposalCreatedLogResponse,
  type ProposalParameters,
} from "./types";

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

    // skip proposal if no proposal data can be fetched
    if (!proposalData) continue;
    const creationData = await getProposalCreationData(
      chain,
      contractAddress,
      BigInt(i),
      proposalData.parameters.snapshotBlock,
      proposalData.parameters.startDate
    );

    // skip to next proposal if no creation data can be found for the current proposal
    if (!creationData) continue;
    const metadataCid = fromHex(creationData.metadata as Hex, "string");

    //TODO: Use IPFS hash from proposalData instead of logs
    const metadata = await fetchJsonFromIpfs(metadataCid);
    const { githubId, snapshotId } = await getProposalBindings(metadata);

    // prepare the base data for both approval and confirmation stages
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

    // generate the relevant approval status based on whether proposal is an emergency
    const status = proposalData.parameters.emergency
      ? computeEmergencyStatus({
          startDate: proposalData.parameters.startDate,
          endDate: proposalData.parameters.endDate,
          executed: proposalData.executed,
          approvals: proposalData.approvals,
          emergencyMinApprovals: proposalData.parameters.minApprovals,
          isSignaling: proposalData.actions.length === 0,
        })
      : computeApprovalStatus({
          startDate: proposalData.parameters.startDate,
          endDate: proposalData.parameters.endDate,
          executed: proposalData.executed,
          approvals: proposalData.approvals,
          minApprovals: proposalData.parameters.minApprovals,
        });

    proposals.push({
      ...baseProposalData,
      id: ProposalStages.COUNCIL_APPROVAL,
      status,
      voting: {
        startDate: proposalData.parameters.startDate.toString(),
        endDate: proposalData.firstDelayStartBlock?.toString() ?? proposalData.parameters.endDate.toString(),
        approvals: proposalData.approvals,
        quorum: proposalData.parameters.minApprovals,
        snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
      },
    });

    // if confirmation stage has yet to start continue to next proposal
    if (!proposalData.firstDelayStartBlock) continue;
    const confirmationStartDate = proposalData.firstDelayStartBlock + proposalData.parameters.delayDuration;
    const lockedPeriodPassed = confirmationStartDate < BigInt(Math.floor(Date.now() / 1000));

    // generate confirmation stage if the proposal has been approved by the council
    // after the time lock period has passed
    if (lockedPeriodPassed) {
      const confirmationStatus = computeConfirmationStatus({
        startDate: confirmationStartDate,
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
          startDate: confirmationStartDate.toString(),
          endDate: proposalData.parameters.endDate.toString(),
          approvals: proposalData.confirmations,
          quorum: proposalData.parameters.minApprovals,
          snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
        },
      });
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
    parameters: {
      // new multisig data
      delayDuration: BigInt(1),
      emergency: false,
      emergencyMinApprovals: BigInt(1),
      ...data[2],
    } as ProposalParameters,
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
      // queued for next stage
      return "queued";
    }
    return "active";
  } else {
    // proposal end date has passed
    return "rejected";
  }
}

interface IComputeEmergencyStatus {
  startDate: bigint;
  endDate: bigint;
  executed: boolean;
  approvals: number;
  emergencyMinApprovals: number;
  isSignaling: boolean;
}
function computeEmergencyStatus({
  approvals,
  emergencyMinApprovals,
  isSignaling,
  executed,
  startDate,
  endDate,
}: IComputeEmergencyStatus): ProposalStatus {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const superMajorityReached = approvals >= emergencyMinApprovals;

  if (executed) {
    return "executed";
  }

  if (startDate > now) {
    return "pending";
  }

  // proposal is within time boundaries
  if (now <= endDate) {
    if (superMajorityReached) {
      return "accepted";
    }

    return "active";
  }

  // end date is passed
  // approvals reached
  if (superMajorityReached) {
    return isSignaling ? "accepted" : "expired";
  } else {
    return "rejected";
  }
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
