import { logger } from "@/services/logger";
import { type IFetchSnapshotVotingActivity } from "@/services/snapshot/params";
import { type SnapshotVotingActivity, type SnapshotVotingActivityQueryResponse } from "@/services/snapshot/types";
import { getSnapshotVotingActivityData } from "@/services/snapshot/fetch";

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  const response = await getSnapshotVotingActivityData(params);
  return parseVotingActivity(response);
}

function parseVotingActivity(data: SnapshotVotingActivityQueryResponse): SnapshotVotingActivity[] {
  return data.votes.map((vote) => ({
    id: vote.id,
    choice: vote.proposal.choices[Number(vote.choice) - 1],
    proposalId: vote.proposal.id,
    createdAt: new Date(Number(vote.created) * 1000).toISOString(),
  }));
}
