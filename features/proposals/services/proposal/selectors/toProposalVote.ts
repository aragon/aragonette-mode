import { type IVoteChoice } from "@/features/proposals/components/votesDataList/votesDataListItemStructure";
import { ProposalStages, type IProposalVote } from "../domain";

export function toProposalVotes(data: IProposalVote[], stageId: ProposalStages) {
  return data.map((vote) => {
    return {
      id: vote.id,
      address: vote.address,
      votingPower: stageId === ProposalStages.COMMUNITY_VOTING ? `${vote.amount} vePOL` : undefined,
      choice: vote.vote as IVoteChoice,
    };
  });
}
