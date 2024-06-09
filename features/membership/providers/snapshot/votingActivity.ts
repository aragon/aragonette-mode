import { snapshotVotingActivityQuery } from "./gql";
import { type IFetchSnapshotVotingActivity } from "./params";
import { type SnapshotVotingActivity, type SnapshotVotingActivityQueryResponse } from "./types";
import { fetchSnapshotData } from "./utils";

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  const response = await fetchSnapshotData<SnapshotVotingActivityQueryResponse>(snapshotVotingActivityQuery(params));
  return parseVotingActivity(response);
}

function parseVotingActivity(data: SnapshotVotingActivityQueryResponse): SnapshotVotingActivity[] {
  return data.votes.map((vote) => ({
    id: vote.id,
    proposalId: vote.proposal.id,
    choice: vote.proposal.choices[Number(vote.choice) + 1],
    createdAt: new Date(Number(vote.created) * 1000).toISOString(),
  }));
}
