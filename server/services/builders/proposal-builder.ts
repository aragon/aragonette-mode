import { PUB_CHAIN, SNAPSHOT_SPACE } from "@/constants";
import {
  ProposalStages,
  ProposalStatus,
  StageOrder,
  StageStatus,
  type IProposal,
  type IProposalResource,
  type IProposalStage,
  type IVotingData,
} from "@/features/proposals/services/domain";
import { logger } from "@/services/logger";
import { type IPublisher } from "@aragon/ods";
import { getSnapshotProposalStage, getSnapshotProposalStages } from "../../../services/snapshot/proposalStages";
import { type ProposalStage, type VotingData } from "../../models/proposals/types";
import dayjs from "dayjs";

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
    proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.mip ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.TRANSPARENCY_REPORT)?.mip ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COUNCIL_APPROVAL)?.mip ??
    proposalStages.find((stage) => stage.stageType === ProposalStages.COMMUNITY_VOTING)?.mip ??
    "unknown";

  return id;
}

export async function getAllProposalsStages() {
  const promises = [getSnapshotProposalStages({ space: SNAPSHOT_SPACE })];

  return (await Promise.all(promises)).flat();
}

export async function getProposalStages(snapshotProposalId: string): Promise<ProposalStage[]> {
  logger.info(`Getting updated stages for snapshot proposal: ${snapshotProposalId}...`);

  const stages = await Promise.all([getSnapshotProposalStage({ providerId: snapshotProposalId })]);

  return [...stages.flatMap((stage) => stage ?? [])];
}

const getProposalBindingId = (stage: ProposalStage) => {
  // For development purposes, we are using the MIP number as the binding ID
  // TODO: Handle with RD-303
  if (stage.stageType === ProposalStages.DRAFT || stage.stageType === ProposalStages.TRANSPARENCY_REPORT) {
    if (stage.mip) return stage.mip;
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
  logger.info(`Fetching all proposal stages...`);
  const proposalStages = await getAllProposalsStages();
  logger.info(`All proposal stages fetched successfully.`);

  return proposalStages.map((stage) => buildProposalResponse([stage]));
}

export function buildProposalResponse(proposalStages: ProposalStage[], overwriteId?: string): IProposal {
  const id = overwriteId ?? computeProposalId(proposalStages);

  logger.info(`Building proposal ${id} with ${proposalStages.length} stages...`);

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
  const includedMips = proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.includedMips ?? [];
  const parentMip = proposalStages.find((stage) => stage.stageType === ProposalStages.DRAFT)?.parentMip;

  // sorted stages
  const stages = buildProposalStageResponse(proposalStages);
  const resources = computeProposalResources(stages);
  const status = computeProposalStatus(proposalStages);
  const statusMessage = proposalStages.find((stage) => stage.stageType === currentStage)?.statusMessage;
  const createdAt = computeProposalCreatedAt(proposalStages)?.toISOString();

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
    includedMips,
    parentMip,
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
  logger.info(`Getting voting data for proposal ${providerId}-${stage}...`);

  switch (stage) {
    case ProposalStages.COMMUNITY_VOTING:
      return (await getSnapshotProposalStage({ providerId }))?.voting;
    default:
      return undefined;
  }
}

export async function buildVotingResponse(
  stage: IProposalStage
): Promise<[IVotingData, StageStatus, ProposalStatus] | undefined> {
  logger.info(`Building voting response for stage ${stage.id}...`);

  if (!isActiveStage(stage)) {
    logger.info(`Stage ${stage.id} is not active.`);
    return undefined;
  }

  logger.info(`Getting voting data for stage ${stage.id}...`);
  const voting = await getVotingData(stage.type, stage.voting!.providerId);

  if (!voting) {
    logger.info(`No voting data found for stage ${stage.id}.`);
    return undefined;
  }

  return [buildVotingData(voting), voting.status, voting.overallStatus];
}

export async function buildLiveProposalResponse(proposal: IProposal) {
  logger.info(`Building live snapshot proposal ${proposal.id}`);

  // get onchain provider id
  const snapshotProposalId = proposal.stages.find((stage) => stage.type === ProposalStages.COMMUNITY_VOTING)?.voting
    ?.providerId;

  const activeProposal =
    proposal.status === ProposalStatus.PENDING ||
    proposal.status === ProposalStatus.ACTIVE ||
    (proposal.status === ProposalStatus.ACCEPTED && proposal.actions.length > 0);

  // return the stored proposal if it is inactive or not onchain
  if (!snapshotProposalId || !activeProposal) {
    logger.info(`Proposal inactive, returning stored proposal ${proposal.id}`);
    return null;
  }

  // get stages, build proposal and add voting responses
  const stages = await getProposalStages(snapshotProposalId);
  const updatedProposal = buildProposalResponse(stages, proposal.id);

  const votingResponses = await Promise.all(updatedProposal.stages.map((stage) => buildVotingResponse(stage)));
  votingResponses.forEach((response, index) => {
    if (response) {
      updatedProposal.stages[index].voting = response?.[0];
      updatedProposal.stages[index].status = response?.[1];
      updatedProposal.status = response?.[2];
    }
  });

  logger.info(`Returning live proposal ${proposal.id}`);
  return updatedProposal;
}

export function isActiveStage(stage: IProposalStage) {
  return (
    stage.voting &&
    dayjs(stage.voting.endDate).isAfter(dayjs()) &&
    dayjs(stage.voting.startDate).isBefore(dayjs()) &&
    stage.status === StageStatus.ACTIVE
  );
}
