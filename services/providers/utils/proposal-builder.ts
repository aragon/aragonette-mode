import { getGithubProposalData } from "@/services/providers/github/proposals";
import { ProposalStages } from "@/features/proposals/services/proposal/domain";
import { ProposalStage, ProposalStageResponse, ProposalResponse } from "@/services/providers/utils/types";
import { GITHUB_REPO, GITHUB_USER, GITHUB_PATH } from "@/constants";

function computeTitle(proposalStages: ProposalStage[]) {
  let title = proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.title;
  if (!title) {
    title = proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.title;
  }
  if (!title) {
    title = proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.title;
  }
  return title ?? "";
}

function computeDescription(proposalStages: ProposalStage[]) {
  let description = proposalStages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.description;
  if (!description) {
    description = proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING)?.description;
  }
  if (!description) {
    description = proposalStages.find((stage) => stage.id === ProposalStages.DRAFT)?.description;
  }
  return description ?? "";
}

function computeCurrentStage(proposalStages: ProposalStage[]) {
  return Math.max(...proposalStages.map((stage) => stage.id));
}

export async function getProposalStages() {
  const proposalsGithubStage = await getGithubProposalData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    path: GITHUB_PATH,
  });

  return [...proposalsGithubStage];
}

async function matchProposalStages(proposalStages: ProposalStage[]) {
  //TODO: Implement this function
  return proposalStages.map((proposalStage) => [proposalStage]);
}

function buildProposalStageResponse(proposalStages: ProposalStage[]): ProposalStageResponse[] {
  function parseId(id: ProposalStages) {
    switch (id) {
      case ProposalStages.DRAFT:
        return "draft";
      case ProposalStages.COUNCIL_APPROVAL:
        return "council_approval";
      case ProposalStages.COMMUNITY_VOTING:
        return "community_voting";
      default:
        return "draft";
    }
  }
  return proposalStages.map((proposalStage) => {
    return {
      id: parseId(proposalStage.id),
      status: proposalStage.status,
      creator: proposalStage.creator,
      link: proposalStage.link,
      voting: proposalStage.voting,
    };
  });
}

export async function buildProposalResponse(): Promise<ProposalResponse[]> {
  const proposalStages = await getProposalStages();
  const allMatchedProposalStages = await matchProposalStages(proposalStages);

  return allMatchedProposalStages.map((matchedProposalStages) => {
    const title = computeTitle(matchedProposalStages);
    const description = computeDescription(matchedProposalStages);
    const currentStage = computeCurrentStage(matchedProposalStages);
    const status = matchedProposalStages.find((stage) => stage.id === currentStage)?.status || "draft";

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
}
