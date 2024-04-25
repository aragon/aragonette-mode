import { GITHUB_PATH, GITHUB_REPO, GITHUB_USER, SNAPSHOT_SPACE, PUB_CHAIN, PUB_MULTISIG_ADDRESS } from "@/constants";
import { ProposalStages, type IProposal, type IProposalStage } from "@/features/proposals/services/proposal/domain";
import { type ProposalStatus } from "@aragon/ods";
import { getGitHubProposalStagesData } from "../github/proposalStages";
import { getSnapshotProposalStagesData } from "../snapshot/proposalStages";
import { getMultisigProposalData } from "../multisig/proposalStages";
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
  return sortProposalStages(proposalStages)[proposalStages.length - 1].id;
}

function sortProposalStages(proposalStages: ProposalStage[]): ProposalStage[] {
  const stageOrder = {
    [ProposalStages.DRAFT]: 0,
    [ProposalStages.COUNCIL_APPROVAL]: 1,
    [ProposalStages.COMMUNITY_VOTING]: 2,
    [ProposalStages.COUNCIL_CONFIRMATION]: 3,
  };

  return proposalStages.sort((a, b) => stageOrder[a.id] - stageOrder[b.id]);
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
  // TODO: remove this
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
  const pip4ProposalStages = proposals.find((stage) => stage.find((proposal) => proposal.pip === "PIP-4"));
  if (pip4ProposalStages) {
    const pip4CommunityVotingProposal = proposalStages.find(
      (stage) => stage.id === ProposalStages.COMMUNITY_VOTING && stage.pip === "PIP-4"
    );
    if (pip4CommunityVotingProposal) pip4ProposalStages.push(pip4CommunityVotingProposal);
  }

  return proposals;
}

function buildProposalStageResponse(proposalStages: ProposalStage[]): IProposalStage[] {
  return sortProposalStages(proposalStages).map((proposalStage) => {
    return {
      id: proposalStage.id,
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
    const isEmergency = matchedProposalStages.some((stage) => stage.isEmergency);

    return {
      pip: matchedProposalStages[0].pip!,
      title,
      description,
      status,
      isEmergency,
      type: matchedProposalStages[0].type!,
      currentStage,
      stages: proposalStageResponses,
    };
  });

  return response;
}
