import { ProposalStages } from "@/features/proposals/services/proposal/domain";
import { VotingData, VotingScores, IProposalStageProvider } from "@/services/providers/utils/types";
import { snapshotProposalsQuery, SnapshotProposalData, requestProposalData } from "./queries";

function parseSnapshotData(data: SnapshotProposalData[]) {
  return data.map((proposal) => {
    const scores: VotingScores[] = proposal.scores.map((score, index) => {
      return {
        choice: proposal.choices[index],
        votes: score,
        percentage: score / proposal.votes,
      };
    });

    const voting: VotingData = {
      startDate: proposal.start.toString(),
      endDate: proposal.end.toString(),
      choices: proposal.choices,
      snapshotBlock: proposal.snapshot,
      quorum: proposal.quorum,
      scores,
      total_votes: proposal.votes,
    };

    return {
      id: ProposalStages.COMMUNITY_VOTING,
      title: proposal.title,
      description: proposal.title,
      body: proposal.body,
      status: proposal.state,
      creator: proposal.author,
      link: proposal.link,
      voting,
    };
  });
}

export const getSnapshotProposalData: IProposalStageProvider = async function (params: { space: string }) {
  return requestProposalData(snapshotProposalsQuery(params.space))
    .then((res) => res.data.proposals as SnapshotProposalData[])
    .then(parseSnapshotData);
};
