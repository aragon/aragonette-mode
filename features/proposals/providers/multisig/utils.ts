import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_CHAIN } from "@/constants";
import { config } from "@/context/Web3Modal";
import { type ProposalStage, type Vote, type VotingData } from "@/features/proposals/models/proposals";
import {
  type ApprovedLogResponse,
  type ConfirmedLogResponse,
  type VotesData,
} from "@/features/proposals/providers/multisig/types";
import { ProposalStages, ProposalStatus, StageStatus } from "@/features/proposals/services/proposal/domain";
import { logger } from "@/services/logger";
import { fetchJsonFromIpfs } from "@/utils/ipfs";
import { type Action } from "@/utils/types";
import { getBlock, getPublicClient, readContract } from "@wagmi/core";
import { fromHex, getAbiItem, type Address, type Hex } from "viem";
import {
  type MultiSigProposalVotingData,
  type MultisigProposal,
  type PrimaryMetadata,
  type ProposalCreatedLogResponse,
  type ProposalParameters,
  type SecondaryMetadata,
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
        proposalId: proposalId.toString(),
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
    creator: logData.creator,
    tx,
    block,
    createdAt: blockData.timestamp,
  };
};

const getProposalBindings = async function (metadata: PrimaryMetadata, secondaryMetadata?: SecondaryMetadata) {
  const githubLink = metadata.resources.find((resource) => resource.name.toLowerCase() === "github");
  const snapshotLink = secondaryMetadata?.resources?.find((resource) => resource.name.toLowerCase() === "snapshot");

  const githubFileName = githubLink?.url.split("/").pop()?.split(".")?.shift();
  const snapshotId = snapshotLink?.url.split("/").pop();

  return {
    githubId: githubFileName,
    snapshotId,
  };
};

export function parseVotingData(voting?: MultiSigProposalVotingData): VotingData | undefined {
  if (!voting) return;

  // Parse dates
  const startDate = new Date(parseInt(voting.startDate) * 1000);
  const endDate = new Date(parseInt(voting.endDate) * 1000);

  return {
    providerId: voting.providerId,
    startDate,
    endDate,
    quorum: voting.quorum,
    snapshotBlock: voting.snapshotBlock,
    choices: ["approve"],
    scores: [
      {
        choice: "approve",
        votes: voting.approvals,
        percentage: (voting.approvals / voting.quorum) * 100,
      },
    ],
    total_votes: voting.approvals,
  };
}

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

    const voting = parseVotingData(proposal.voting);

    const creator = [
      {
        link: `${PUB_CHAIN.blockExplorers?.default.url}/address/${proposal.creator}`,
        address: proposal.creator,
      },
    ];

    const createdAt = new Date(parseInt(proposal.createdAt) * 1000);

    return {
      stageType: proposal.stageType,
      title: proposal.title,
      description: proposal.summary,
      body: proposal.description,
      status: proposal.status,
      overallStatus: proposal.overallStatus,
      createdAt,
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

export const requestVotingData = async function (
  chain: number,
  contractAddress: Address,
  stage: "approval" | "confirmation",
  proposalId: number
): Promise<MultiSigProposalVotingData | undefined> {
  const proposalData = await getProposalData(chain, contractAddress, BigInt(proposalId));

  if (!proposalData) return;

  if (stage === "approval") {
    return {
      providerId: proposalId.toString(),
      startDate: proposalData.parameters.startDate.toString(),
      endDate: proposalData.firstDelayStartTimestamp?.toString() ?? proposalData.parameters.endDate.toString(),
      approvals: proposalData.approvals,
      quorum: proposalData.parameters.minApprovals,
      snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
    };
  } else if (stage === "confirmation") {
    if (!proposalData.firstDelayStartTimestamp) return;

    const confirmationStartDate = proposalData.firstDelayStartTimestamp + proposalData.parameters.delayDuration;
    const lockedPeriodPassed = confirmationStartDate < BigInt(Math.floor(Date.now() / 1000));

    if (!lockedPeriodPassed) return;
    return {
      providerId: proposalId.toString(),
      startDate: confirmationStartDate.toString(),
      endDate: proposalData.parameters.endDate.toString(),
      approvals: proposalData.confirmations,
      quorum: proposalData.parameters.minApprovals,
      snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
    };
  }
};

export const requestProposalsData = async function (
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
    const primaryMetadataCid = fromHex(proposalData.primaryMetadata as Hex, "string");
    const secondaryMetadataCid = fromHex(proposalData.secondaryMetadata as Hex, "string");

    const primaryMetadata: PrimaryMetadata = await fetchJsonFromIpfs(primaryMetadataCid);
    const secondaryMetadata = secondaryMetadataCid
      ? ((await fetchJsonFromIpfs(secondaryMetadataCid)) as SecondaryMetadata)
      : undefined;

    const { githubId, snapshotId } = await getProposalBindings(primaryMetadata, secondaryMetadata);

    const pip = githubId ?? primaryMetadata.title.match(/[A-Z]+-\d+/)?.[0] ?? "unknown";

    // get resources
    const resources = primaryMetadata.resources.concat(secondaryMetadata?.resources ?? []).flatMap((resource) => {
      if (!resource.name && !resource.url) return [];

      return {
        name: resource.name,
        link: resource.url,
      };
    });

    // prepare the base data for both approval and confirmation stages
    const baseProposalData = {
      pip,
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
    const [stageStatus, overallStatus] = proposalData.parameters.emergency
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
      stageType: ProposalStages.COUNCIL_APPROVAL,
      status: stageStatus,
      overallStatus,
      voting: {
        providerId: i.toString(),
        startDate: proposalData.parameters.startDate.toString(),
        endDate: proposalData.firstDelayStartTimestamp?.toString() ?? proposalData.parameters.endDate.toString(),
        approvals: proposalData.approvals,
        quorum: proposalData.parameters.minApprovals,
        snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
      },
    });

    // if confirmation stage has yet to start continue to next proposal
    if (!proposalData.firstDelayStartTimestamp) continue;
    const confirmationStartDate = proposalData.firstDelayStartTimestamp + proposalData.parameters.delayDuration;
    const lockedPeriodPassed = confirmationStartDate < BigInt(Math.floor(Date.now() / 1000));

    // generate confirmation stage if the proposal has been approved by the council
    // after the time lock period has passed
    if (lockedPeriodPassed) {
      const [confirmationStatus, overallCStatus] = computeConfirmationStatus({
        startDate: confirmationStartDate,
        endDate: proposalData.parameters.endDate,
        executed: proposalData.executed,
        confirmations: proposalData.confirmations,
        minApprovals: proposalData.parameters.minApprovals,
        isSignaling: proposalData.actions.length === 0,
      });

      proposals.push({
        ...baseProposalData,
        stageType: ProposalStages.COUNCIL_CONFIRMATION,
        status: confirmationStatus,
        overallStatus: overallCStatus,
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
  approvals: number;
  parameters: ProposalParameters;
  actions: Array<Action>;
  allowFailureMap: bigint;
  executed: boolean;

  // new multisig data
  primaryMetadata: string;
  secondaryMetadata: string | undefined;
  firstDelayStartTimestamp: bigint | null;
  confirmations: number;
};

function decodeProposalResultData(data?: Array<any>): ProposalData | null {
  if (!data?.length && data?.length != 9) return null;
  return {
    executed: data[0] as boolean,
    approvals: data[1] as number,
    parameters: data[2] as ProposalParameters,
    actions: data[3] as Array<Action>,
    allowFailureMap: data[4] as bigint,

    // new multisig data
    confirmations: data[5] as number,
    primaryMetadata: data[6] as string,
    secondaryMetadata: data[7] as string,
    firstDelayStartTimestamp: data[8] as bigint,
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
        proposalId: proposalId.toString(),
      } as any,
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

const getConfirmationLogs = async function (
  contractAddress: Address,
  proposalId: bigint,
  snapshotBlock: bigint,
  endDate: bigint
) {
  const publicClient = getPublicClient(config);

  const ConfirmationEvent = getAbiItem({
    abi: MultisigAbi,
    name: "Confirmed",
  });

  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ConfirmationEvent,
      args: {
        proposalId: proposalId.toString(),
      } as any,
      fromBlock: snapshotBlock,
      toBlock: endDate,
    })
    .then((logs) => {
      if (!logs?.length) return [];
      return logs.map((log) => {
        const tx = log.transactionHash;
        const block = log.blockNumber;

        const logData: ConfirmedLogResponse = log.args as ConfirmedLogResponse;
        return { logData, tx, block };
      });
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  return logs;
};

export const getMultisigVotingPower = async function (
  chain: number,
  contractAddress: Address,
  address: string,
  proposalId?: string,
  confirm?: boolean
): Promise<number> {
  if (!proposalId) {
    return getMultisigIsMember(chain, contractAddress, address).then((canVote) => (canVote ? 1 : 0));
  } else {
    if (confirm) {
      return getMultisigCanConfirm(chain, contractAddress, proposalId, address).then((canVote) => (canVote ? 1 : 0));
    }
    return getMultisigCanApprove(chain, contractAddress, proposalId, address).then((canVote) => (canVote ? 1 : 0));
  }
};

export const getMultisigCanApprove = async function (
  chain: number,
  contractAddress: Address,
  proposalId: string,
  address: string
) {
  return readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "canApprove",
    args: [proposalId as any, address as Address],
  });
};

export const getMultisigIsMember = async function (chain: number, contractAddress: Address, address: string) {
  return readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "isMember",
    args: [address as Address],
  });
};

export const getMultisigCanConfirm = async function (
  chain: number,
  contractAddress: Address,
  proposalId: string,
  address: string
) {
  return readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "canConfirm",
    args: [proposalId as any, address as Address],
  });
};

const getBlockTimestamp = async function (blockNumber: bigint) {
  return await getBlock(config, {
    chainId: PUB_CHAIN.id,
    blockNumber,
  }).then((block) => block.timestamp.toString());
};

export const requestApprovalData = async function (
  chain: number,
  contractAddress: Address,
  providerId: bigint
): Promise<VotesData[]> {
  const proposalData = await getProposalData(chain, contractAddress, providerId);

  if (!proposalData) return [];

  const approvalLogs = await getApproveLogs(
    contractAddress,
    providerId,
    proposalData.parameters.snapshotBlock,
    proposalData.parameters.endDate
  );

  if (!approvalLogs) return [];

  const logsWithTimestamp = await Promise.all(
    approvalLogs.map(async (log) => {
      const blockTimestamp = await getBlockTimestamp(log.block);
      return { ...log, blockTimestamp } as VotesData;
    })
  );

  return logsWithTimestamp;
};

export const requestConfirmationData = async function (
  chain: number,
  contractAddress: Address,
  providerId: bigint
): Promise<VotesData[]> {
  const proposalData = await getProposalData(chain, contractAddress, providerId);

  if (!proposalData?.firstDelayStartTimestamp || proposalData.firstDelayStartTimestamp === BigInt(0)) return [];
  const confirmationLogs = await getConfirmationLogs(
    contractAddress,
    providerId,
    proposalData.parameters.snapshotBlock,
    proposalData.parameters.endDate
  );

  if (!confirmationLogs) return [];

  const logsWithTimestamp = await Promise.all(
    confirmationLogs.map(async (log) => {
      const blockTimestamp = await getBlockTimestamp(log.block);
      return { ...log, blockTimestamp } as VotesData;
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
}: IComputeApprovalStatus): [StageStatus, ProposalStatus] {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const approvalsReached = approvals >= minApprovals;

  if (executed) {
    return [StageStatus.APPROVED, ProposalStatus.EXECUTED];
  }

  if (now < startDate) {
    return [StageStatus.PENDING, ProposalStatus.PENDING];
  }

  // proposal is within time boundaries
  if (now <= endDate) {
    if (approvalsReached) {
      return [StageStatus.APPROVED, ProposalStatus.ACTIVE];
    }
    return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
  }

  // Proposal end date has passed
  if (!approvalsReached) {
    return [StageStatus.REJECTED, ProposalStatus.REJECTED];
  }

  return [StageStatus.APPROVED, ProposalStatus.EXPIRED];
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
}: IComputeEmergencyStatus): [StageStatus, ProposalStatus] {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const superMajorityReached = approvals >= emergencyMinApprovals;
  if (executed) {
    return [StageStatus.APPROVED, ProposalStatus.EXECUTED];
  }

  if (now < startDate) {
    return [StageStatus.PENDING, ProposalStatus.PENDING];
  }

  // proposal is within time boundaries
  if (now <= endDate) {
    if (superMajorityReached)
      return isSignaling
        ? [StageStatus.APPROVED, ProposalStatus.EXECUTED]
        : [StageStatus.APPROVED, ProposalStatus.ACTIVE];

    return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
  }

  // Proposal end date has passed
  if (!superMajorityReached) {
    return [StageStatus.REJECTED, ProposalStatus.REJECTED];
  }

  return isSignaling ? [StageStatus.APPROVED, ProposalStatus.EXECUTED] : [StageStatus.APPROVED, ProposalStatus.EXPIRED];
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
}: IComputeConfirmationStatus): [StageStatus, ProposalStatus] {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const confirmationsReached = confirmations >= minApprovals;

  if (executed) {
    return [StageStatus.APPROVED, ProposalStatus.EXECUTED];
  }

  if (now < startDate) {
    return [StageStatus.PENDING, ProposalStatus.ACTIVE];
  }

  if (now <= endDate) {
    if (confirmationsReached)
      return isSignaling
        ? [StageStatus.APPROVED, ProposalStatus.EXECUTED]
        : [StageStatus.APPROVED, ProposalStatus.ACTIVE];

    return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
  }

  // Proposal end date has passed
  if (!confirmationsReached) {
    return [StageStatus.REJECTED, ProposalStatus.REJECTED];
  }

  return isSignaling ? [StageStatus.APPROVED, ProposalStatus.EXECUTED] : [StageStatus.APPROVED, ProposalStatus.EXPIRED];
}
