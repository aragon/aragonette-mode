import { type Vote, type IProposalVotesProvider, type IProposalVotingPowerProvider } from "../../models/proposals";
import { snapshotVotesQuery, snapshotVotingPowerQuery } from "./gql";
import { type SnapshotVoteData, type SnapshotVotingPowerData } from "./types";
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
    .then((res) => res.data.votes as SnapshotVoteData[])
    .then(parseSnapshotVoteData);
};

export const getSnapshotVotingPower: IProposalVotingPowerProvider = async function (params: {
  space: string;
  providerId: string;
  voter: string;
}) {
  return requestProposalData(snapshotVotingPowerQuery(params.space, params.providerId, params.voter)).then(
    (res) => (res.data.vp as SnapshotVotingPowerData).vp
  );
};
