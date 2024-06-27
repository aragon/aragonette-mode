import {
  GITHUB_PIPS_PATH,
  GITHUB_REPO,
  GITHUB_TRANSPARENCY_REPORTS_PATH,
  GITHUB_USER,
  PUB_CHAIN,
  PUB_MULTISIG_ADDRESS,
  SNAPSHOT_SPACE,
} from "@/constants";
import {
  ProposalStages,
  StageOrder,
  type IProposal,
  type IProposalResource,
  type IProposalStage,
  type IVotingData,
  StageStatus,
  ProposalStatus,
} from "@/features/proposals/services/domain";
import { type IPublisher } from "@aragon/ods";
import {
  getGitHubProposalStagesData,
  getGithubTransparencyReports,
  getGitHubProposalStageData,
  getGithubTransparencyReport,
} from "../../../services/github/proposalStages";
import {
  getMultisigProposalsData,
  getMultisigProposalData,
  getMultisigVotingData,
} from "../../../services/rpc/multisig/proposalStages";
import { getSnapshotProposalStages, getSnapshotProposalStage } from "../../../services/snapshot/proposalStages";
import { type ProposalStage, type VotingData } from "../../models/proposals/types";
import { logger } from "@/services/logger";

/**
 * Computes the title of a proposal based on its stages. It searches through
 * the provided stages in a specific order:
 * 1. COUNCIL_APPROVAL
 * 2. DRAFT
 * 3. COMMUNITY_VOTING
 * It returns the title of the first stage found in this priority order.
 * If none of these stages have a title, it returns an empty string.
 *
 * @param  proposalStages - Array of proposal stage objects.
 * @returns the title of the current proposal stage or an empty string if not found.
 */
function computeTitle(proposalStages: ProposalStage[]): string {
  return (
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.title ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.title ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.title ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.title ??
    ""
  );
}

/**
 * Computes the description of a proposal based on its stages. Similar to computeTitle,
 * it searches through the stages in the order of:
 * 1. COUNCIL_APPROVAL
 * 2. DRAFT
 * 3. COMMUNITY_VOTING
 * It returns the description of the first stage found in this priority order.
 * If none of these stages have a description, it returns an empty string.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns The description of the current proposal stage or an empty string if not found.
 */
function computeDescription(proposalStages: ProposalStage[]): string {
  return (
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.description ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.description ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.description ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.description ??
    ""
  );
}

/**
 * Computes the body of a proposal based on its stages. Similar to computeDescription,
 * it searches through the stages in the order of:
 * 1. COUNCIL_APPROVAL
 * 2. DRAFT
 * 3. COMMUNITY_VOTING
 * It returns the description of the first stage found in this priority order.
 * If none of these stages have a description, it returns an empty string.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns The description of the current proposal stage or an empty string if not found.
 */
function computeBody(proposalStages: ProposalStage[]): string {
  return (
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.body ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.body ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.body ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.body ??
    ""
  );
}

/**
 * Determines the current stage of a proposal by examining the proposal stages.
 * The function sorts the stages, looks for specific stages (DRAFT, COUNCIL_CONFIRMATION),
 * and uses a set of rules to determine the current stage based on the presence and order of these stages.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns The identifier of the current proposal stage.
 */
function computeCurrentStage(proposalStages: ProposalStage[]): ProposalStages {
  const sortedStages = sortProposalStages(proposalStages);
  const draftStage = sortedStages.find((stage) => stage.stageType === ProposalStages.DRAFT);
  const approvalStage = sortedStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL);

  // last stage that is active
  // Note: can have community and confirmation active together
  const lastActive = sortedStages.findLast((stage) => stage.status === StageStatus.ACTIVE);

  if (lastActive) {
    return lastActive.stageType;
  }

  // no last active stage means proposal is not active.
  const lastKnownStage = sortedStages[sortedStages.length - 1];

  // usually the last stage is the current stage, but because some proposals were created without
  // all the stages, we have to check whether that "last stage" (in this case COMMUNITY_VOTING) is
  // ongoing or not. If it's not, we should use the DRAFT stage as the current stage.
  // By default only the Peer Review proposals are allowed to go onchain and be voted on by the community
  // TODO: Handle with RD-303
  if (lastKnownStage.stageType === ProposalStages.COMMUNITY_VOTING && draftStage && approvalStage == null) {
    return draftStage.stageType;
  }

  return lastKnownStage.stageType;
}

/**
 * Computes the current status of a proposal based on its stages and the current stage index.
 * It checks for a status in the COUNCIL_APPROVAL stage; if not found, it defaults to the DRAFT stage's status.
 * If neither are present, it returns 'draft'. This function also considers the status based on the relative position
 * of the current and next stages.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @param currentStageIndex - The index of the current stage in the proposal stages array.
 * @returns The computed status of the proposal.
 */
function computeProposalStatus(proposalStages: ProposalStage[]): ProposalStatus {
  const draftStage = proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.overallStatus;
  const transparencyReportStage = proposalStages.find(
    (stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT
  )?.overallStatus;
  const councilApprovalStage = proposalStages.find(
    (stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL
  )?.overallStatus;
  const communityVotingStage = proposalStages.find(
    (stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING
  )?.overallStatus;
  const councilConfirmationStage = proposalStages.find(
    (stage) => stage.stageType === ProposalStages.COUNCIL_CONFIRMATION
  )?.overallStatus;

  return (
    councilConfirmationStage ??
    communityVotingStage ??
    councilApprovalStage ??
    draftStage ??
    transparencyReportStage ??
    ProposalStatus.PENDING
  );
}

/**
 * Computes the proposal createdAt based on the DRAFT stage. If the DRAFT stage is not found, it uses the COUCIL_APPROVAL stage.
 * If neither are present, it returns the COMMUNITY_VOTING stage, or the COUNCIL_CONFIRMATION stage if none of the previous stages are found.
 * If none of these stages have a createdAt date, it returns an empty string.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns The createdAt date of the proposal.
 */
function computeProposalCreatedAt(proposalStages: ProposalStage[]): Date | undefined {
  return (
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.createdAt ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.createdAt ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.createdAt ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.createdAt ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_CONFIRMATION)?.createdAt
  );
}

/**
 * Computes the publisher(s) of a proposal based on whether the proposal is marked as an emergency.
 * If the proposal is an emergency, it fetches the creator from the COUNCIL_APPROVAL stage;
 * otherwise, it takes from the DRAFT stage.
 *
 * @param stages - Array of proposal stage objects.
 * @param isEmergency - Indicates whether the proposal is an emergency.
 * @returns Array of publishers for the proposal.
 */
function computePublisher(stages: ProposalStage[], isEmergency: boolean): IPublisher[] {
  const originalCreators = isEmergency
    ? stages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.creator
    : stages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.creator;

  return (
    (originalCreators ?? stages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.creator)?.map(
      (creator) => ({ address: "", ...creator })
    ) ?? [{ address: "", name: "Unknown" }]
  );
}

/**
 * Determines the type of a proposal by checking the proposal stages in a specific order:
 * COUNCIL_APPROVAL, DRAFT, COMMUNITY_VOTING. It returns the type of the first found stage.
 * If none of these stages have a type, it returns "unknown".
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns The type of the proposal or 'unknown' if no type is found.
 */
function computeProposalType(proposalStages: ProposalStage[]): string {
  return (
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.type ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.type ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.type ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.type ??
    "unknown"
  );
}

/**
 * Get all the proposal resources from the sorted stages.
 * The later stages will overwrite the resources of the previous stages.
 *
 * @param sortedStages Sorted proposal stages
 * @returns an array of proposal resources.
 */
function computeProposalResources(sortedStages: IProposalStage[]): IProposalResource[] {
  const resourcesMap = new Map<string, IProposalResource>();
  sortedStages
    .flatMap((stage) => stage.resources ?? [])
    .forEach((resource) => resourcesMap.set(resource.name.toLowerCase(), resource));

  return resourcesMap.size > 0 ? Array.from(resourcesMap.values()) : [];
}

/**
 * Sorts proposal stages based on a predefined order of stage identifiers.
 * This order is determined by a mapping of stage identifiers to numerical values,
 * allowing the stages to be sorted in a logical progression.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns Sorted array of proposal stages.
 */
function sortProposalStages(proposalStages: ProposalStage[]): ProposalStage[] {
  return proposalStages.sort((a, b) => StageOrder[a.stageType] - StageOrder[b.stageType]);
}

function computeProposalId(proposalStages: ProposalStage[]): string {
  const id =
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.pip ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.pip ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.pip ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.pip ??
    "unknown";

  return id;
}

export async function getAllProposalsStages() {
  const promises = [
    getGitHubProposalStagesData({
      user: GITHUB_USER,
      repo: GITHUB_REPO,
      pips_path: GITHUB_PIPS_PATH,
    }),
    getGithubTransparencyReports({
      user: GITHUB_USER,
      repo: GITHUB_REPO,
      transparency_reports_path: GITHUB_TRANSPARENCY_REPORTS_PATH,
    }),
    getSnapshotProposalStages({ space: SNAPSHOT_SPACE }),
    getMultisigProposalsData({
      chain: PUB_CHAIN.id,
      contractAddress: PUB_MULTISIG_ADDRESS,
    }),
  ];

  return (await Promise.all(promises)).flat();
}

export async function getProposalStages(onchainProposalId: string): Promise<ProposalStage[]> {
  logger.info(`Getting updated stages for multisig proposal: ${onchainProposalId}...`);

  // update the dynamic stages
  // fetch the multisig data
  const multisigData = await getMultisigProposalData({
    chain: PUB_CHAIN.id,
    contractAddress: PUB_MULTISIG_ADDRESS,
    proposalId: parseInt(onchainProposalId),
  });

  const stageIds = [
    // update draft
    {
      stage: ProposalStages.DRAFT,
      id: multisigData[0].bindings?.find((binding) => binding.id === ProposalStages.DRAFT)?.link,
    },

    // update transparency report
    {
      stage: ProposalStages.TRANSPARENCY_REPORT,
      id: multisigData[0].bindings?.find((binding) => binding.id === ProposalStages.TRANSPARENCY_REPORT)?.link,
    },

    // update community voting
    {
      stage: ProposalStages.COMMUNITY_VOTING,
      id: multisigData[0].bindings?.find((binding) => binding.id === ProposalStages.COMMUNITY_VOTING)?.link,
    },
  ];

  const stages = await Promise.all(
    stageIds.map(({ stage, id }) => {
      switch (stage) {
        case ProposalStages.DRAFT:
          return getGitHubProposalStageData({
            user: GITHUB_USER,
            repo: GITHUB_REPO,
            pips_path: GITHUB_PIPS_PATH,
            pip: id,
          });
        case ProposalStages.TRANSPARENCY_REPORT:
          return getGithubTransparencyReport({
            user: GITHUB_USER,
            repo: GITHUB_REPO,
            pips_path: GITHUB_PIPS_PATH,
            pip: id,
          });
        case ProposalStages.COMMUNITY_VOTING:
          return getSnapshotProposalStage({ providerId: id });
      }
    })
  );

  return [...multisigData, ...stages.flatMap((stage) => stage ?? [])];
}

const getProposalBindingId = (stage: ProposalStage) => {
  // For development purposes, we are using the PIP number as the binding ID
  // TODO: Handle with RD-303
  if (stage.stageType === ProposalStages.DRAFT || stage.stageType === ProposalStages.TRANSPARENCY_REPORT) {
    if (stage.pip) return stage.pip;
    else return stage.title.match(/[A-Z]+-\d+/)?.[0] ?? "unknown";
  }
  if (stage.stageType === ProposalStages.COMMUNITY_VOTING) {
    return stage.resources
      ?.find((r) => r?.name.toLowerCase() === "snapshot" && r.link != null)
      ?.link?.split("/")
      .pop();
  }

  return stage.title.match(/[A-Z]+-\d+/)?.[0] ?? "unknown";
};

/**
 * Matches proposal stages based on their identifiers and specific linking criteria. This function organizes
 * proposals into coherent groups by linking stages such as DRAFT, COUNCIL_APPROVAL, COMMUNITY_VOTING, and
 * COUNCIL_CONFIRMATION based on bindings and other criteria. It also handles special cases like manually binding
 * specific proposals together.
 *
 * @param  proposalStages - Array of proposal stage objects.
 * @returns An array of arrays, where each inner array contains linked proposal stages.
 */
export async function matchProposalStages(proposalStages: ProposalStage[]): Promise<ProposalStage[][]> {
  const draftProposals = proposalStages.filter((stage) => stage.stageType === ProposalStages.DRAFT);
  const transparencyReports = proposalStages.filter((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT);
  const councilApprovalProposals = proposalStages.filter(
    (stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL
  );

  const communityVotingProposals = proposalStages.filter(
    (stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING
  );
  const councilConfirmationProposals = proposalStages.filter(
    (stage) => stage.stageType === ProposalStages.COUNCIL_CONFIRMATION
  );

  const proposals = councilApprovalProposals.map((proposal) => [proposal]);

  proposals.forEach((proposal) => {
    const draftBindingLink = proposal[0].bindings?.find((binding) => binding.id === ProposalStages.DRAFT)?.link;
    if (draftBindingLink) {
      const draftProposal = draftProposals.find((stage) => getProposalBindingId(stage) === draftBindingLink);
      if (draftProposal) {
        proposal.push(draftProposal);
      }
    }

    const transparencyReportsBindingLink = proposal[0].bindings?.find(
      (binding) => binding.id === ProposalStages.TRANSPARENCY_REPORT
    )?.link;
    if (transparencyReportsBindingLink) {
      const transparencyReport = transparencyReports.find(
        (stage) => getProposalBindingId(stage) === transparencyReportsBindingLink
      );
      if (transparencyReport) {
        proposal.push(transparencyReport);
      }
    }

    const communityVotingBindingLink = proposal[0].bindings?.find(
      (binding) => binding.id === ProposalStages.COMMUNITY_VOTING
    )?.link;
    if (communityVotingBindingLink) {
      const communityVotingProposal = communityVotingProposals.find(
        (stage) => getProposalBindingId(stage) === communityVotingBindingLink
      );
      if (communityVotingProposal) {
        proposal.push(communityVotingProposal);
      }
    }

    const councilConfirmationBinding = proposal[0].title;
    if (councilConfirmationBinding) {
      const councilConfirmationProposal = councilConfirmationProposals.find(
        (stage) => stage.title === councilConfirmationBinding
      );
      if (councilConfirmationProposal) {
        proposal.push(councilConfirmationProposal);
      }
    }
  });

  // Remove matched proposals from the draft proposals array
  proposals.forEach((proposal) => {
    const draftProposal = proposal.find((stage) => stage.stageType === ProposalStages.DRAFT);
    if (!draftProposal) return;
    const proposalIndex = draftProposals.indexOf(draftProposal);
    draftProposals.splice(proposalIndex, 1);
  });

  proposals.push(...draftProposals.map((proposal) => [proposal]));

  // Manually bind PIP-4 draft and community voting stages
  // TODO: Handle with RD-303
  const pip4ProposalStages = proposals.find((stage) => stage.find((proposal) => proposal.pip === "PIP-04"));
  if (pip4ProposalStages) {
    const pip4CommunityVotingProposal = communityVotingProposals.find((stage) => stage.title.startsWith("PIP-4"));
    if (pip4CommunityVotingProposal) pip4ProposalStages.push(pip4CommunityVotingProposal);
  }

  return proposals;
}

function buildVotingData(voting: VotingData): IVotingData {
  return {
    providerId: voting.providerId,
    isActive: voting.endDate > new Date() && voting.startDate < new Date(),
    startDate: voting.startDate?.toISOString(),
    endDate: voting.endDate?.toISOString(),
    choices: voting.choices,
    snapshotBlock: voting.snapshotBlock,
    quorum: voting.quorum,
    scores: voting.scores,
    total_votes: voting.total_votes,
  };
}

/**
 * Builds an array of transformed proposal stage objects from the given proposal stages. Each stage is transformed
 * to include only selected properties. This function also sorts the proposal stages before transforming them.
 *
 * @param proposalStages - Array of proposal stage objects to be transformed.
 * @returns an array of proposal stages with selected properties for each stage.
 */
function buildProposalStageResponse(proposalStages: ProposalStage[]): IProposalStage[] {
  return sortProposalStages(proposalStages).map((proposalStage) => {
    return {
      id: proposalStage.stageType,
      type: proposalStage.stageType,
      status: proposalStage.status,
      statusMessage: proposalStage.statusMessage,
      creator: proposalStage.creator,
      createdAt: proposalStage.createdAt?.toISOString(),
      resources: proposalStage.resources,
      voting: proposalStage.voting && buildVotingData(proposalStage.voting),
    };
  });
}

/**
 * Builds a comprehensive array of proposal responses by first fetching the proposal stages,
 * matching them based on specific criteria, and then constructing detailed proposal objects from these matched stages.
 *
 * @returns an array of fully constructed proposal objects.
 */
export async function buildProposalsResponse(): Promise<IProposal[]> {
  logger.info(`Fetching all proposals...`);

  const proposalStages = await getAllProposalsStages();
  const allMatchedProposalStages = await matchProposalStages(proposalStages);

  logger.info(`Proposals fetched successfully.`);
  return allMatchedProposalStages.map(buildProposalResponse);
}

export function buildProposalResponse(proposalStages: ProposalStage[]): IProposal {
  logger.info(`Building proposal ${proposalStages.find((stage) => stage.pip)?.pip} with stages...`);

  const title = computeTitle(proposalStages);
  const type = computeProposalType(proposalStages);
  const isEmergency = proposalStages.some((stage) => stage.isEmergency);
  const publisher = computePublisher(proposalStages, isEmergency);
  const description = computeDescription(proposalStages);
  const body = computeBody(proposalStages);
  const currentStage = computeCurrentStage(proposalStages);
  const transparencyReport = proposalStages.find(
    (stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT
  )?.body;
  const includedPips = proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.includedPips ?? [];
  const parentPip = proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.parentPip;

  // sorted stages
  const stages = buildProposalStageResponse(proposalStages);
  const resources = computeProposalResources(stages);
  const status = computeProposalStatus(proposalStages);
  const statusMessage = proposalStages.find((stage) => stage.stageType === currentStage)?.statusMessage;
  const createdAt = computeProposalCreatedAt(proposalStages)?.toISOString();

  const id = computeProposalId(proposalStages);

  const actions =
    proposalStages
      .find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)
      ?.actions?.map((action) => {
        return {
          to: action.to,
          value: action.value.toString(),
          data: action.data,
        };
      }) ?? [];

  logger.info(`Proposal built successfully.`);

  return {
    id,
    title,
    description,
    includedPips,
    parentPip,
    body,
    transparencyReport,
    resources,
    status,
    statusMessage,
    isEmergency,
    createdAt,
    type,
    currentStage,
    publisher,
    stages,
    actions,
  };
}

export async function getVotingData(stage: ProposalStages, providerId: string): Promise<VotingData | undefined> {
  switch (stage) {
    case ProposalStages.COMMUNITY_VOTING:
      return (await getSnapshotProposalStage({ providerId }))?.voting;
    case ProposalStages.COUNCIL_APPROVAL:
      return await getMultisigVotingData({
        chain: PUB_CHAIN.id,
        contractAddress: PUB_MULTISIG_ADDRESS,
        stage: "approval",
        providerId: BigInt(providerId),
      });
    case ProposalStages.COUNCIL_CONFIRMATION:
      return await getMultisigVotingData({
        chain: PUB_CHAIN.id,
        contractAddress: PUB_MULTISIG_ADDRESS,
        stage: "confirmation",
        providerId: BigInt(providerId),
      });
    default:
      return undefined;
  }
}

export async function buildVotingResponse(
  stage: IProposalStage
): Promise<[IVotingData, StageStatus, ProposalStatus] | undefined> {
  if (!stage.voting) return undefined;
  const voting = await getVotingData(stage.type, stage.voting.providerId);

  if (!voting) return undefined;

  return [buildVotingData(voting), voting.status, voting.overallStatus];
}

export async function buildLiveProposalResponse(proposal: IProposal) {
  logger.info(`Building live multisig proposal ${proposal.id}`);

  // get onchain provider id
  const onchainProposalId = proposal.stages.find((stage) => stage.type === ProposalStages.COUNCIL_APPROVAL)?.voting
    ?.providerId;

  const activeProposal =
    proposal.status === ProposalStatus.PENDING ||
    proposal.status === ProposalStatus.ACTIVE ||
    (proposal.status === ProposalStatus.ACCEPTED && proposal.actions.length > 0);

  // return the stored proposal if it is inactive or not onchain
  if (!onchainProposalId || !activeProposal) {
    logger.info(`Proposal inactive or offchain, returning stored proposal ${proposal.id}`);
    return proposal;
  }

  // get stages, build proposal and add voting responses
  const stages = await getProposalStages(onchainProposalId);
  const updatedProposal = buildProposalResponse(stages);

  const votingResponses = await Promise.all(updatedProposal.stages.map((stage) => buildVotingResponse(stage)));
  votingResponses.forEach((response, index) => {
    updatedProposal.stages[index].voting = response?.[0];
    updatedProposal.stages[index].status = response?.[1] as StageStatus;
    updatedProposal.status = response?.[2] as ProposalStatus;
  });

  logger.info(`Returning live proposal ${proposal.id}`);
  return updatedProposal;
}
