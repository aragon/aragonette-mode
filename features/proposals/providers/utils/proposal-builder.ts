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
  type ProposalStatus,
} from "@/features/proposals/services/proposal/domain";
import VercelCache from "@/services/cache/VercelCache";
import { type IPublisher } from "@aragon/ods";
import { getGitHubProposalStagesData } from "../github/proposalStages";
import { getMultisigProposalData } from "../multisig/proposalStages";
import { getSnapshotProposalStagesData } from "../snapshot/proposalStages";
import { type ProposalStage } from "../../models/proposals";

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
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.title ??
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.title ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.title ??
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
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.description ??
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.description ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.description ??
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
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.body ??
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.body ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.body ??
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
  const draftStage = sortedStages.find((stage) => stage.id === ProposalStages.DRAFT);
  const confirmationStage = sortedStages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION);
  const lastKnownStage = sortedStages[sortedStages.length - 1];

  // usually the last stage is the current stage, but because some proposals were created without
  // all the stages, we have to check whether that "last stage" (in this case COMMUNITY_VOTING) is
  // ongoing or not. If it's not, we should use the DRAFT stage as the current stage.
  // By default only the Peer Review proposals are allowed to go onchain and be voted on by the community
  // TODO: Handle with RD-303
  if (lastKnownStage.id === ProposalStages.COMMUNITY_VOTING && draftStage && confirmationStage == null) {
    return draftStage.id;
  }

  return lastKnownStage.id;
}

/**
 * Calculates the relative status of a proposal based on the current stage and the next stage.
 * The function uses the current stage status and the start date of the next stage to determine the relative status.
 *
 * @param currentStage - The current proposal stage.
 * @param nextStage - The next proposal stage.
 * @returns The relative status of the proposal.
 */
function calculateRelativeProposalStatus(currentStage: IProposalStage, nextStage?: IProposalStage): ProposalStatus {
  switch (currentStage.id) {
    case ProposalStages.DRAFT:
      return currentStage.status;
    case ProposalStages.COUNCIL_APPROVAL:
      return currentStage.status;
    case ProposalStages.COMMUNITY_VOTING:
      return computeOverlappingStageStatus(currentStage.status, nextStage?.voting?.startDate);
    case ProposalStages.COUNCIL_CONFIRMATION:
      return currentStage.status;
    default:
      return "draft";
  }
}

/**
 * Computes the overlapping status of a proposal stage based on the current stage status and the start date of the next stage.
 * The function determines whether the current stage is still active or queued based on the start date of the next stage.
 *
 * @param currentStageStatus - The status of the current proposal stage.
 * @param nextStageStartDate - The start date of the next proposal stage.
 * @returns The overlapping status of the proposal stage.
 */
function computeOverlappingStageStatus(currentStageStatus: ProposalStatus, nextStageStartDate?: string) {
  const now = Date.now();
  const parsedStartDate = Number(nextStageStartDate) / 1000;

  if (
    (currentStageStatus === "accepted" || (currentStageStatus === "rejected" && nextStageStartDate)) &&
    parsedStartDate < now
  ) {
    return "active";
  } else {
    return "queued";
  }
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
function computeProposalStatus(proposalStages: IProposalStage[], currentStageIndex: number): ProposalStatus {
  const draftStageStatus = proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.status;
  const approvalStageStatus = proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.status;
  const calculatedStatus = calculateRelativeProposalStatus(
    proposalStages[currentStageIndex], // current stage
    proposalStages[currentStageIndex + 1] // next stage
  );

  return approvalStageStatus ? calculatedStatus : draftStageStatus ?? "draft";
}

/**
 * Computes the proposal createdAt based on the DRAFT stage. If the DRAFT stage is not found, it uses the COUCIL_APPROVAL stage.
 * If neither are present, it returns the COMMUNITY_VOTING stage, or the COUNCIL_CONFIRMATION stage if none of the previous stages are found.
 * If none of these stages have a createdAt date, it returns an empty string.
 *
 * @param proposalStages - Array of proposal stage objects.
 * @returns The createdAt date of the proposal.
 */
function computeProposalCreatedAt(proposalStages: ProposalStage[]): string {
  return (
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.createdAt ??
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.createdAt ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.createdAt ??
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION)?.createdAt ??
    ""
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
    ? stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.creator
    : stages.find((stage) => stage.id === ProposalStages.DRAFT)?.creator;

  return (
    (originalCreators ?? stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.creator)?.map(
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
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.type ??
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.type ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.type ??
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
  return proposalStages.sort((a, b) => StageOrder[a.id] - StageOrder[b.id]);
}

export async function getProposalStages() {
  const proposalsGithubStage = await getGitHubProposalStagesData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    pips_path: GITHUB_PIPS_PATH,
    transparency_reports_path: GITHUB_TRANSPARENCY_REPORTS_PATH,
  });

  const proposalsSnapshotStage = await getSnapshotProposalStagesData({ space: SNAPSHOT_SPACE });

  const proposalsMultisigStage = await getMultisigProposalData({
    chain: PUB_CHAIN.id,
    contractAddress: PUB_MULTISIG_ADDRESS,
  });

  return [...proposalsGithubStage, ...proposalsSnapshotStage, ...proposalsMultisigStage];
}

const getProposalBindingId = (stage: ProposalStage) => {
  // For development purposes, we are using the PIP number as the binding ID
  // TODO: Handle with RD-303
  if (stage.id === ProposalStages.DRAFT) return stage.pip?.split("-").pop();
  if (stage.id === ProposalStages.COMMUNITY_VOTING) {
    return stage.resources
      ?.find((r) => r?.name === "Snapshot" && r.link != null)
      ?.link?.split("/")
      .pop();
  }

  return stage.title;
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
  const draftProposals = proposalStages.filter((stage) => stage.id === ProposalStages.DRAFT);
  const councilApprovalProposals = proposalStages.filter((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL);
  const communityVotingProposals = proposalStages.filter((stage) => stage.id === ProposalStages.COMMUNITY_VOTING);
  const councilConfirmationProposals = proposalStages.filter(
    (stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION
  );

  const proposals = councilApprovalProposals.map((proposal) => [proposal]);

  proposals.forEach((proposal) => {
    const draftBindingLink = proposal[0].bindings?.find((binding) => binding.id === ProposalStages.DRAFT)?.link;
    if (draftBindingLink) {
      const draftProposal = draftProposals.find((stage) => getProposalBindingId(stage) === draftBindingLink);
      if (draftProposal) {
        proposal.push(draftProposal);
        draftProposals.splice(draftProposals.indexOf(draftProposal), 1);
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
        communityVotingProposals.splice(communityVotingProposals.indexOf(communityVotingProposal), 1);
      }
    }

    const councilConfirmationBinding = proposal[0].title;
    if (councilConfirmationBinding) {
      const councilConfirmationProposal = councilConfirmationProposals.find(
        (stage) => stage.title === councilConfirmationBinding
      );
      if (councilConfirmationProposal) {
        proposal.push(councilConfirmationProposal);
        councilConfirmationProposals.splice(councilConfirmationProposals.indexOf(councilConfirmationProposal), 1);
      }
    }
  });

  proposals.push(...draftProposals.map((proposal) => [proposal]));

  // Manually bind PIP-4 draft and community voting stages
  // TODO: Handle with RD-303
  const pip4ProposalStages = proposals.find((stage) => stage.find((proposal) => proposal.pip === "4"));
  if (pip4ProposalStages) {
    const pip4CommunityVotingProposal = proposalStages.find(
      (stage) => stage.id === ProposalStages.COMMUNITY_VOTING && stage.title.startsWith("PIP-4")
    );
    if (pip4CommunityVotingProposal) pip4ProposalStages.push(pip4CommunityVotingProposal);
  }

  return proposals;
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
      id: proposalStage.id,
      status: proposalStage.status,
      creator: proposalStage.creator,
      createdAt: proposalStage.createdAt,
      resources: proposalStage.resources,
      voting: proposalStage.voting,
    };
  });
}

/**
 * Builds a comprehensive array of proposal responses by first fetching the proposal stages,
 * matching them based on specific criteria, and then constructing detailed proposal objects from these matched stages.
 *
 * @returns an array of fully constructed proposal objects.
 */
export async function buildProposalResponse(): Promise<IProposal[]> {
  const proposalStages = await getProposalStages();
  const allMatchedProposalStages = await matchProposalStages(proposalStages);

  return allMatchedProposalStages.map((matchedProposalStages) => {
    const title = computeTitle(matchedProposalStages);
    const type = computeProposalType(matchedProposalStages);
    const isEmergency = matchedProposalStages.some((stage) => stage.isEmergency);
    const publisher = computePublisher(matchedProposalStages, isEmergency);
    const description = computeDescription(matchedProposalStages);
    const body = computeBody(matchedProposalStages);
    const currentStage = computeCurrentStage(matchedProposalStages);
    const transparencyReport = matchedProposalStages.find(
      (stage) => stage.id === ProposalStages.DRAFT
    )?.transparency_report;
    const includedPips = matchedProposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.includedPips ?? [];
    const parentPip = matchedProposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.parentPip;

    // sorted stages
    const stages = buildProposalStageResponse(matchedProposalStages);
    const resources = computeProposalResources(stages);
    const currentStageIndex = stages.findIndex((stage) => stage.id === currentStage);
    const status = computeProposalStatus(stages, currentStageIndex);
    const createdAt = computeProposalCreatedAt(matchedProposalStages);

    // TODO: Get emergency proposal prefix from polygon
    const proposalNumber = matchedProposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.pip ?? "";
    const id = `${isEmergency ? "TBD" : "PIP"}-${proposalNumber}`;

    const actions =
      matchedProposalStages
        .find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)
        ?.actions?.map((action) => {
          return {
            to: action.to,
            value: action.value.toString(),
            data: action.data,
          };
        }) ?? [];

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
      isEmergency,
      createdAt,
      type,
      currentStage,
      publisher,
      stages,
      actions,
    };
  });
}

export async function getCachedProposals(): Promise<IProposal[]> {
  const cache = new VercelCache();

  let proposals = await cache.get<IProposal[]>("proposals");

  if (!proposals) {
    const freshProposals = await buildProposalResponse();
    await cache.set("proposals", freshProposals);
    proposals = freshProposals;
  }

  return proposals;
}

export async function getCachedProposalById(proposalId: string): Promise<IProposal | undefined> {
  const proposals = await getCachedProposals();
  return proposals.find((proposal) => proposal.id.toLowerCase() === proposalId.toLowerCase());
}
