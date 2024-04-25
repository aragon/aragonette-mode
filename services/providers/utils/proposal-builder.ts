import { getGithubProposalData } from "@/services/providers/github/proposals";
import { getSnapshotProposalData } from "@/services/providers/snapshot/proposals";
import { getMultisigProposalData } from "@/services/providers/multisig/proposals";
import { ProposalStages } from "@/features/proposals/services/proposal/domain";
import { ProposalStage, ProposalStageResponse, ProposalResponse } from "@/services/providers/utils/types";
import { GITHUB_REPO, GITHUB_USER, GITHUB_PATH, SNAPSHOT_SPACE, PUB_CHAIN, PUB_MULTISIG_ADDRESS } from "@/constants";

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
  const proposalsSnapshotStage = await getSnapshotProposalData({ space: SNAPSHOT_SPACE });
  const proposalsMultisigStage = await getMultisigProposalData({
    chain: PUB_CHAIN.id,
    contractAddress: PUB_MULTISIG_ADDRESS,
  });

  return [...proposalsGithubStage, ...proposalsSnapshotStage, ...proposalsMultisigStage];
}

async function matchProposalStages(proposalStages: ProposalStage[]) {
  // TODO: Implement this function
  // Manual matching for testing purposes

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
      const draftProposal = draftProposals.find((stage) => stage.pip?.split("-").pop() === draftBindingLink);
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
        (stage) => stage.link.split("/").pop() === communityVotingBindingLink
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

  //TODO: Match proposal PIP-4
  //const pip4DraftProposal = proposalStages.find((stage) => stage.pip === "4");
  //const pip4CommunityVotingProposal = proposalStages.find((stage) => stage.id === ProposalStages.COMMUNITY_VOTING);

  //if (!pip4DraftProposal || !pip4CommunityVotingProposal) return [];
  //pip4DraftProposal.push(pip4CommunityVotingProposal);

  return proposals;
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
      case ProposalStages.COUNCIL_CONFIRMATION:
        return "council_confirmation";
      default:
        return "draft";
    }
  }
  return proposalStages
    .sort((a, b) => a.id - b.id)
    .map((proposalStage) => {
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
