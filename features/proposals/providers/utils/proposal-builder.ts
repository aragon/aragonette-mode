import { GITHUB_PATH, GITHUB_REPO, GITHUB_USER, SNAPSHOT_SPACE } from "@/constants";
import {
  ProposalStageTitles,
  ProposalStages,
  type IProposal,
  type IProposalStage,
} from "@/features/proposals/services/proposal/domain";
import { type ProposalStatus } from "@aragon/ods";
import { getGitHubProposalStagesData } from "../github/proposalStages";
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

function computeCurrentStage(proposalStages: ProposalStage[]) {
  return Math.max(...proposalStages.map((stage) => stage.id));
}

export async function getProposalStages() {
  const proposalsGithubStage = await getGitHubProposalStagesData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    path: GITHUB_PATH,
  });

  const proposalsSnapshotStage = await getSnapshotProposalStagesData({ space: SNAPSHOT_SPACE });
  return [...proposalsGithubStage, ...proposalsSnapshotStage];
}

async function matchProposalStages(proposalStages: ProposalStage[]) {
  // TODO: Implement this function
  // Manual matching for testing purposes
  const proposals = proposalStages.map((proposalStage) => [proposalStage]);

  const pip4DraftProposal = proposals.find((stages) => stages[0].pip === "4");

  const foundIndex = proposals.findIndex((stages) => stages[0].id === ProposalStages.COMMUNITY_VOTING);
  const pip4CommunityVotingProposal = proposals[foundIndex][0];

  if (!pip4DraftProposal || !pip4CommunityVotingProposal) {
    return [];
  } else {
    pip4DraftProposal.push(pip4CommunityVotingProposal);

    // remove from proposalStages
    proposals.splice(foundIndex, 1);
  }

  return proposals;
}

function buildProposalStageResponse(proposalStages: ProposalStage[]): IProposalStage[] {
  function parseId(id: ProposalStages) {
    switch (id) {
      case ProposalStages.DRAFT:
        return ProposalStageTitles.DRAFT;
      case ProposalStages.COUNCIL_APPROVAL:
        return ProposalStageTitles.COUNCIL_APPROVAL;
      case ProposalStages.COMMUNITY_VOTING:
        return ProposalStageTitles.COMMUNITY_VOTING;
      default:
        return ProposalStageTitles.DRAFT;
    }
  }

  return proposalStages.map((proposalStage) => {
    return {
      id: proposalStage.id,
      title: parseId(proposalStage.id),
      status: proposalStage.status as ProposalStatus,
      creator: proposalStage.creator,
      link: proposalStage.link,
      voting: proposalStage.voting,
    };
  });
}

export async function buildProposalResponse(): Promise<IProposal[]> {
  const proposalStages = await getProposalStages();
  const allMatchedProposalStages = await matchProposalStages(proposalStages);

  const response = allMatchedProposalStages.map((matchedProposalStages) => {
    const title = computeTitle(matchedProposalStages);
    const description = computeDescription(matchedProposalStages);
    const currentStage = computeCurrentStage(matchedProposalStages);

    // TODO: Implement function to calculate overall status
    const status = matchedProposalStages.find((stage) => stage.id === currentStage)?.status ?? "draft";
    const proposalStageResponses = buildProposalStageResponse(matchedProposalStages);

    return {
      pip: matchedProposalStages[0].pip!,
      title,
      description,
      status,
      type: matchedProposalStages[0].type!,
      currentStage,
      stages: proposalStageResponses,
    };
  });

  return response;
}
