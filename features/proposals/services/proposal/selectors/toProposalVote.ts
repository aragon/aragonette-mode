import { type IVotesDataListVariant } from "@/features/proposals/components/proposalVoting/votesDataList/votesDataListItemStructure";
import { ProposalStages, type IProposalVote } from "../domain";
import { PUB_TOKEN_SYMBOL } from "@/constants";

export function toProposalVotes(data: IProposalVote[], stageId: ProposalStages) {
  return data.map((vote) => {
    return {
      id: vote.id,
      address: vote.address,
      votingPower: stageId === ProposalStages.COMMUNITY_VOTING ? `${vote.amount} ${PUB_TOKEN_SYMBOL}` : undefined,
      choice: (stageId === ProposalStages.COMMUNITY_VOTING
        ? mapCommunityVoteChoice(vote.vote)
        : vote.vote.toLowerCase()) as IVotesDataListVariant,
    };
  });
}

function mapCommunityVoteChoice(choice: string) {
  switch (choice.toLowerCase()) {
    case "accept":
    case "approve":
      return "yes";
    case "reject":
    case "veto":
      return "no";
    default:
      return choice;
  }
}
