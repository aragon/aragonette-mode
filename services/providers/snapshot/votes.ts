import { Vote, IProposalVotesProvider } from "@/services/providers/utils/types";
import { snapshotVotesQuery, SnapshotVoteData, requestProposalData } from "./queries";

function parseSnapshotVoteData(data: SnapshotVoteData[]): Vote[] {
  return data.map((vote) => {
    const choice = Object.keys(vote.choice)[0];

    return {
      id: vote.id,
      voter: vote.voter,
      choice: choice,
      amount: vote.vp,
      timestamp: vote.created.toString(),
    };
  });
}

export const getSnapshotVotesData: IProposalVotesProvider = async function (params: { proposal: string }) {
  return requestProposalData(snapshotVotesQuery(params.proposal))
    .then((res) => res.data.votes as SnapshotVoteData[])
    .then(parseSnapshotVoteData);
};
