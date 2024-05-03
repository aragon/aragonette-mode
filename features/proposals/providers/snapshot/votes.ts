import { type Vote, type IProposalVotesProvider } from "../utils/types";
import { snapshotVotesQuery } from "./gql";
import { type SnapshotVoteData } from "./types";
import { requestProposalData } from "./utils";

function parseSnapshotVoteData(data: SnapshotVoteData[]): Vote[] {
  return data.map((vote) => {
    return {
      id: vote.id,
      voter: vote.voter,
      choice: vote.choice.toString(), // TODO: Pick from proposal choices in storage -> proposal.choices[vote.choice]
      amount: vote.vp,
      timestamp: vote.created.toString(),
    };
  });
}

export const getSnapshotVotesData: IProposalVotesProvider = async function (params: { providerId: string }) {
  return requestProposalData(snapshotVotesQuery(params.providerId))
    .then((res) => {
      return res.data.votes as SnapshotVoteData[];
    })
    .then(parseSnapshotVoteData);
};
