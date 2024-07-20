import { type IVotesDataListVariant } from "@/components/votesDataList/votesDataListItemStructure";
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
      justification: vote.reason,
    };
  });
}

function mapCommunityVoteChoice(choice: string) {
  switch (choice.toLowerCase()) {
    case "accept":
    case "yes":
    case "approve":
      return "yes";
    case "reject":
    case "veto":
    case "no":
      return "no";
    default:
      return choice;
  }
}
