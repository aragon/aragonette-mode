import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { config } from "@/context/Web3Modal";
import { PUB_CHAIN } from "@/constants";
import { type ProposalStage, type Vote } from "@/features/proposals/providers/utils/types";
import { ProposalStages, type ProposalStatus } from "@/features/proposals/services/proposal/domain";
import { logger } from "@/services/logger";
import { type ApprovedLogResponse, type VotesData } from "@/features/proposals/providers/multisig/types";
import { fetchJsonFromIpfs } from "@/utils/ipfs";
import { type Action } from "@/utils/types";
import { getBlock, getPublicClient, readContract } from "@wagmi/core";
import {
  type PrimaryMetadata,
  type ProposalCreatedLogResponse,
  type ProposalParameters,
  type MultisigProposal,
  type SecondaryMetadata,
} from "./types";
import { fromHex, getAbiItem, type Address, type Hex } from "viem";

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
      event: ProposalCreatedEvent,
      args: {
        proposalId,
      } as any,
      fromBlock: snapshotBlock,
      toBlock: startDate,
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  if (!logs?.length) throw new Error("No creation logs");

  const log = logs[0];
  const block = log.blockNumber;
  const tx = log.transactionHash;

  const logData: ProposalCreatedLogResponse = log.args as ProposalCreatedLogResponse;

  const blockData = await publicClient?.getBlock({ blockNumber: block }).catch((err) => {
    logger.error("Could not fetch the proposal blocknumber", err);
  });

  if (!blockData) throw new Error("No block data");

  return {
    primaryMetadata: logData.metadata,
    secondaryMetadata: logData.secondaryMetadata ?? "",
    creator: logData.creator,
    tx,
    block,
    createdAt: blockData.timestamp,
  };
};

const getProposalBindings = async function (metadata: PrimaryMetadata, secondaryMetadata?: SecondaryMetadata) {
  const githubLink = metadata.resources.find((resource) => resource.name.toLowerCase() === "github");
  const snapshotLink =
    secondaryMetadata ?? metadata.resources.find((resource) => resource.name.toLowerCase() === "snapshot");

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
      providerId: proposal.voting.providerId,
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
      createdAt: proposal.createdAt,
      isEmergency: proposal.isEmergency,
      resources: proposal.resources ?? [],
      creator,
      link: proposal.link,
      voting,
      actions: proposal.actions,
      bindings,
    };
  });
}

export const requestProposalData = async function (
  chain: number,
  contractAddress: Address
): Promise<MultisigProposal[]> {
  const numProposals = await getNumProposals(chain, contractAddress);

  const proposals: MultisigProposal[] = [];

  for (let i = 0; i < numProposals; i++) {
    const proposalData = await getProposalData(chain, contractAddress, BigInt(i));

    // skip proposal if no proposal data can be fetched
    if (!proposalData) continue;
    const creationData = await getProposalCreationData(
      contractAddress,
      BigInt(i),
      proposalData.parameters.snapshotBlock,
      proposalData.parameters.startDate
    );

    // skip to next proposal if no creation data can be found for the current proposal
    if (!creationData) continue;
    const primaryMetadataCid = fromHex(creationData.primaryMetadata as Hex, "string");
    const secondaryMetadataCid = fromHex(creationData.secondaryMetadata as Hex, "string");

    //TODO: Use IPFS hash from proposalData instead of logs
    const primaryMetadata: PrimaryMetadata = await fetchJsonFromIpfs(primaryMetadataCid);
    const secondaryMetadata = secondaryMetadataCid ? await fetchJsonFromIpfs(secondaryMetadataCid) : undefined;
    const { githubId, snapshotId } = await getProposalBindings(primaryMetadata, secondaryMetadata);

    // get resources
    const resources = primaryMetadata.resources.map((resource) => ({
      name: resource.name,
      link: resource.url,
    }));

    // prepare the base data for both approval and confirmation stages
    const baseProposalData = {
      title: primaryMetadata.title,
      summary: primaryMetadata.summary,
      description: primaryMetadata.description,
      createdAt: creationData.createdAt.toString(),
      creator: creationData.creator,
      link: `${PUB_CHAIN.blockExplorers?.default.url}/tx/${creationData.tx}`,
      actions: proposalData.actions,
      isEmergency: proposalData.parameters.emergency,
      resources,
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
        providerId: i.toString(),
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
          providerId: i.toString(),
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

export const parseMultisigVotesData = (votes: VotesData[]): Vote[] => {
  return votes.map((vote) => {
    return {
      id: vote.tx,
      choice: "Approve",
      voter: vote.logData.approver,
      amount: "1",
      timestamp: vote.blockTimestamp,
    };
  });
};

const getApproveLogs = async function (
  contractAddress: Address,
  proposalId: bigint,
  snapshotBlock: bigint,
  endDate: bigint
) {
  const publicClient = getPublicClient(config);

  const ApprovedEvent = getAbiItem({
    abi: MultisigAbi,
    name: "Approved",
  });

  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ApprovedEvent,
      args: {
        proposalId,
      },
      fromBlock: snapshotBlock,
      toBlock: endDate,
    })
    .then((logs) => {
      if (!logs?.length) return [];
      return logs.map((log) => {
        const tx = log.transactionHash;
        const block = log.blockNumber;

        const logData: ApprovedLogResponse = log.args as ApprovedLogResponse;
        return { logData, tx, block };
      });
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  return logs;
};

const getBlockTimestamp = async function (blockNumber: bigint) {
  return await getBlock(config, {
    chainId: PUB_CHAIN.id,
    blockNumber,
  }).then((block) => block.timestamp.toString());
};

export const requestVotesData = async function (chain: number, contractAddress: Address, providerId: bigint) {
  const proposalData = await getProposalData(chain, contractAddress, providerId);

  if (!proposalData) return [] as VotesData[];

  const logs = await getApproveLogs(
    contractAddress,
    providerId,
    proposalData.parameters.snapshotBlock,
    proposalData.parameters.endDate
  );

  if (!logs) return [] as VotesData[];

  const logsWithTimestamp = await Promise.all(
    logs.map(async (log) => {
      const blockTimestamp = await getBlockTimestamp(log.block);
      return { ...log, blockTimestamp };
    })
  );

  return logsWithTimestamp;
};
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
