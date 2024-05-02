import { GITHUB_PATH, GITHUB_REPO, GITHUB_USER, PUB_CHAIN, PUB_MULTISIG_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import {
  ProposalStages,
  StageOrder,
  type IProposal,
  type IProposalStage,
} from "@/features/proposals/services/proposal/domain";
import { getGitHubProposalStagesData } from "../github/proposalStages";
import { getMultisigProposalData } from "../multisig/proposalStages";
import { getSnapshotProposalStagesData } from "../snapshot/proposalStages";
import { type ProposalStage } from "./types";

function computeTitle(proposalStages: ProposalStage[]) {
  return (
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.title ??
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.title ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.title ??
    ""
  );
}

function computeDescription(proposalStages: ProposalStage[]) {
  return (
    proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.description ??
    proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.description ??
    proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.description ??
    ""
  );
}

function computeCurrentStage(proposalStages: ProposalStage[]): ProposalStages {
  const sortedStages = sortProposalStages(proposalStages);
  const draftStage = sortedStages.find((stage) => stage.id === ProposalStages.DRAFT);
  const confirmationStage = sortedStages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION);
  const lastKnownStage = sortedStages[sortedStages.length - 1];

  // usually the last stage is the current stage, but because some proposals were created without
  // all the stages, we have to check whether that "last stage" (in this case COMMUNITY_VOTING) is
  // ongoing or not. If it's not, we should use the DRAFT stage as the current stage.
  // By default only the Peer Review proposals are allowed to go onchain and be voted on by the community
  // THIS IS TEMPORARY AND SHOULD BE REMOVED.
  // TODO: Handle with RD-303
  if (lastKnownStage.id === ProposalStages.COMMUNITY_VOTING && draftStage && confirmationStage == null) {
    return draftStage.id;
  }

  return lastKnownStage.id;
}

function sortProposalStages(proposalStages: ProposalStage[]): ProposalStage[] {
  return proposalStages.sort((a, b) => StageOrder[a.id] - StageOrder[b.id]);
}

export async function getProposalStages() {
  const proposalsGithubStage = await getGitHubProposalStagesData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    path: GITHUB_PATH,
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
  if (stage.id === ProposalStages.COMMUNITY_VOTING) return stage.link.split("/").pop();
  return stage.title;
};

async function matchProposalStages(proposalStages: ProposalStage[]) {
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

function buildProposalStageResponse(proposalStages: ProposalStage[]): IProposalStage[] {
  return sortProposalStages(proposalStages).map((proposalStage) => {
    return {
      id: proposalStage.id,
      status: proposalStage.status,
      creator: proposalStage.creator,
      link: proposalStage.link,
      voting: proposalStage.voting,
    };
  });
}

export async function buildProposalResponse(): Promise<IProposal[]> {
  const proposalStages = await getProposalStages();
  const allMatchedProposalStages = await matchProposalStages(proposalStages);

  return allMatchedProposalStages.map((matchedProposalStages) => {
    const title = computeTitle(matchedProposalStages);
    const description = computeDescription(matchedProposalStages);
    const stages = buildProposalStageResponse(matchedProposalStages);
    const currentStage = computeCurrentStage(matchedProposalStages);

    const isEmergency = matchedProposalStages.some((stage) => stage.isEmergency);
    const pip = `${isEmergency ? "SOS" : "PIP"}-${matchedProposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.pip ?? ""}`;

    // build the proposal status
    const currentStageIndex = matchedProposalStages.findIndex((stage) => stage.id === currentStage);
    const draftStageStatus = stages.find((stage) => stage.id === ProposalStages.DRAFT)?.status;
    const approvalStageStatus = stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.status;
    const calculatedStatus = computeProposalStatus(
      matchedProposalStages[currentStageIndex], // current stage
      matchedProposalStages[currentStageIndex + 1] // next stage
    );

    // if there is no onchain proposal, use the draft stage status as source of truth for the status
    const status = approvalStageStatus ? calculatedStatus : draftStageStatus ?? "draft";

    return {
      pip,
      title,
      description,
      status,
      isEmergency,
      // TODO: use onchain proposal type as fallback
      type: matchedProposalStages[0].type!,
      currentStage,
      stages,
    };
  });
}

function computeProposalStatus(currentStage: ProposalStage, nextStage?: ProposalStage): string {
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

function computeOverlappingStageStatus(currentStageStatus: string, nextStageStartDate?: string) {
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
