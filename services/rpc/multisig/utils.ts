import { EMERGENCY_PREFIX, PUB_CHAIN } from "@/constants";
import { type ProposalStage, type Vote, type VotingData } from "@/server/models/proposals/types";
import { ProposalStages, ProposalStatus, StageStatus } from "@/features/proposals/services/domain";
import { logger } from "@/services/logger";
import { fetchJsonFromIpfs } from "@/services/ipfs";
import { fromHex, type Address, type Hex } from "viem";
import {
  type MultiSigProposalVotingData,
  type MultisigProposal,
  type PrimaryMetadata,
  type SecondaryMetadata,
  type VotesData,
} from "./types";
import {
  getApproveLogs,
  getBlockTimestamp,
  getConfirmationLogs,
  getMultisigCanApprove,
  getMultisigCanConfirm,
  getMultisigIsMember,
  getNumProposals,
  getProposalCreationData,
  getProposalData,
} from "@/services/rpc/multisig";
import { type ProposalData } from "@/services/rpc/multisig/types";
import { extractIdFromLink } from "@/services/github/utils";

const getProposalBindings = async function (metadata: PrimaryMetadata, secondaryMetadata?: SecondaryMetadata) {
  if (!metadata.resources) throw new Error("No resources found in proposal metadata");

  const githubLink = metadata.resources.find((resource) => resource.name.toLowerCase() === "github");
  const transparencyReportLink =
    secondaryMetadata?.resources?.find((resource) => resource.name.toLowerCase() === "transparency_report") ??
    metadata.resources.find((resource) => resource.name.toLowerCase() === "transparency_report");
  const snapshotLink = secondaryMetadata?.resources?.find((resource) => resource.name.toLowerCase() === "snapshot");

  const githubId = githubLink?.url?.split("/").pop()?.split(".")?.shift();
  const transparencyReportId = extractIdFromLink(transparencyReportLink?.url);
  const snapshotId = snapshotLink?.url?.split("/").pop();

  return {
    githubId,
    transparencyReportId,
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
    status: voting.status,
    overallStatus: voting.overallStatus,
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

    if (proposal.transparencyReportId) {
      bindings.push({
        id: ProposalStages.TRANSPARENCY_REPORT,
        link: proposal.transparencyReportId,
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
      pip: proposal.pip,
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
    const endDate =
      proposalData.firstDelayStartTimestamp && proposalData.firstDelayStartTimestamp > 0
        ? proposalData.firstDelayStartTimestamp
        : proposalData.parameters.endDate;

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
          endDate,
          executed: proposalData.executed,
          approvals: proposalData.approvals,
          minApprovals: proposalData.parameters.minApprovals,
        });

    return {
      status: stageStatus,
      overallStatus,
      providerId: proposalId.toString(),
      startDate: proposalData.parameters.startDate.toString(),
      endDate: endDate.toString(),
      approvals: proposalData.approvals,
      quorum: proposalData.parameters.minApprovals,
      snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
    };
  } else if (stage === "confirmation") {
    if (!proposalData.firstDelayStartTimestamp || proposalData.firstDelayStartTimestamp < 1) return;

    const confirmationStartDate = proposalData.firstDelayStartTimestamp + proposalData.parameters.delayDuration;

    const [confirmationStatus, overallCStatus] = computeConfirmationStatus({
      startDate: confirmationStartDate,
      endDate: proposalData.parameters.endDate,
      executed: proposalData.executed,
      confirmations: proposalData.confirmations,
      minApprovals: proposalData.parameters.minApprovals,
      isSignaling: proposalData.actions.length === 0,
    });

    return {
      status: confirmationStatus,
      overallStatus: overallCStatus,
      providerId: proposalId.toString(),
      startDate: confirmationStartDate.toString(),
      endDate: proposalData.parameters.endDate.toString(),
      approvals: proposalData.confirmations,
      quorum: proposalData.parameters.minApprovals,
      snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
    };
  }
};

const processProposalData = async function (
  proposalData: ProposalData,
  contractAddress: Address,
  proposalId: number,
  emergencyId?: string
) {
  logger.info(`Processing data for multisig proposal:${proposalId}`);

  const proposals: MultisigProposal[] = [];
  const creationData = await getProposalCreationData(
    contractAddress,
    BigInt(proposalId),
    proposalData.parameters.snapshotBlock,
    proposalData.parameters.startDate
  );

  // skip to next proposal if no creation data can be found for the current proposal
  if (!creationData) return [];
  const primaryMetadataCid = fromHex(proposalData.primaryMetadata as Hex, "string");
  const secondaryMetadataCid = fromHex(proposalData.secondaryMetadata as Hex, "string");

  let primaryMetadata: PrimaryMetadata;
  let secondaryMetadata: SecondaryMetadata | undefined;
  try {
    primaryMetadata = await fetchJsonFromIpfs(primaryMetadataCid);
    secondaryMetadata = secondaryMetadataCid ? await fetchJsonFromIpfs(secondaryMetadataCid) : undefined;
  } catch (err) {
    logger.error(`Could not fetch the proposal metadata [${primaryMetadataCid}, ${secondaryMetadataCid}]`, err);
    return [];
  }

  const { githubId, snapshotId, transparencyReportId } = await getProposalBindings(primaryMetadata, secondaryMetadata);

  const pip = githubId ?? emergencyId ?? primaryMetadata.title.match(/[A-Z]+-\d+/)?.[0] ?? "unknown";

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
    transparencyReportId,
    snapshotId,
  };

  const endDate =
    proposalData.firstDelayStartTimestamp && proposalData.firstDelayStartTimestamp > 0
      ? proposalData.firstDelayStartTimestamp
      : proposalData.parameters.endDate;

  // generate the relevant approval status based on whether proposal is an emergency
  const [stageStatus, overallStatus] = proposalData.parameters.emergency
    ? computeEmergencyStatus({
        startDate: proposalData.parameters.startDate,
        endDate,
        executed: proposalData.executed,
        approvals: proposalData.approvals,
        emergencyMinApprovals: proposalData.parameters.minApprovals,
        isSignaling: proposalData.actions.length === 0,
      })
    : computeApprovalStatus({
        startDate: proposalData.parameters.startDate,
        endDate,
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
      status: stageStatus,
      overallStatus,
      providerId: proposalId.toString(),
      startDate: proposalData.parameters.startDate.toString(),
      endDate: endDate.toString(),
      approvals: proposalData.approvals,
      quorum: proposalData.parameters.minApprovals,
      snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
    },
  });

  // if confirmation stage has yet to start continue to next proposal
  if (!proposalData.firstDelayStartTimestamp || proposalData.firstDelayStartTimestamp < 1) return proposals;
  logger.info(`Adding confirmation stage for proposal: ${proposalData.firstDelayStartTimestamp}`);
  const confirmationStartDate = proposalData.firstDelayStartTimestamp + proposalData.parameters.delayDuration;

  // generate confirmation stage if the proposal has been approved by the council
  // after the time lock period has passed
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
      status: stageStatus,
      overallStatus: overallCStatus,
      providerId: proposalId.toString(),
      startDate: confirmationStartDate.toString(),
      endDate: proposalData.parameters.endDate.toString(),
      approvals: proposalData.confirmations,
      quorum: proposalData.parameters.minApprovals,
      snapshotBlock: proposalData.parameters.snapshotBlock.toString(),
    },
  });

  return proposals;
};

export const requestProposalsData = async function (
  chain: number,
  contractAddress: Address
): Promise<MultisigProposal[]> {
  const numProposals = await getNumProposals(chain, contractAddress);

  let proposals: MultisigProposal[] = [];

  const getPromises = [];
  for (let i = 0; i < numProposals; i++) {
    getPromises.push(getProposalData(chain, contractAddress, BigInt(i)));
  }

  const proposalDataList = await Promise.all(getPromises);

  const processPromises = [];
  let numEmergencyProposals = 0;
  for (let i = 0; i < numProposals; i++) {
    const proposalData = proposalDataList[i];

    // skip proposal if no proposal data can be fetched
    if (!proposalData) continue;

    if (proposalData.parameters.emergency) {
      numEmergencyProposals++;
      const emergencyId = `${EMERGENCY_PREFIX}-${numEmergencyProposals.toString().padStart(2, "0")}`;
      processPromises.push(processProposalData(proposalData, contractAddress, i, emergencyId));
    } else {
      processPromises.push(processProposalData(proposalData, contractAddress, i));
    }
  }
  const processedProposals = await Promise.all(processPromises);
  proposals = processedProposals.flat();

  return proposals;
};

export const requestProposalData = async function (
  chain: number,
  contractAddress: Address,
  proposalId: number
): Promise<MultisigProposal[]> {
  let proposals: MultisigProposal[] = [];
  const proposalData = await getProposalData(chain, contractAddress, BigInt(proposalId));

  // skip proposal if no proposal data can be fetched
  if (proposalData) {
    const multisigProposalStages = await processProposalData(proposalData, contractAddress, proposalId);
    proposals = multisigProposalStages;
  }

  return proposals;
};

export const parseMultisigVotesData = (votes: VotesData[]): Vote[] => {
  return votes.map((vote) => {
    return {
      id: vote.tx,
      choice: "approve",
      voter: vote.logData.approver,
      amount: "1",
      timestamp: vote.blockTimestamp,
    };
  });
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
        ? [StageStatus.APPROVED, ProposalStatus.ACCEPTED]
        : [StageStatus.APPROVED, ProposalStatus.ACTIVE];

    return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
  }

  // Proposal end date has passed
  if (!superMajorityReached) {
    return [StageStatus.REJECTED, ProposalStatus.REJECTED];
  }

  return isSignaling ? [StageStatus.APPROVED, ProposalStatus.ACCEPTED] : [StageStatus.APPROVED, ProposalStatus.EXPIRED];
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
    if (confirmationsReached) return [StageStatus.APPROVED, ProposalStatus.ACCEPTED];

    return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
  }

  // Proposal end date has passed
  if (!confirmationsReached) {
    return [StageStatus.REJECTED, ProposalStatus.REJECTED];
  }

  return isSignaling ? [StageStatus.APPROVED, ProposalStatus.ACCEPTED] : [StageStatus.APPROVED, ProposalStatus.EXPIRED];
}
