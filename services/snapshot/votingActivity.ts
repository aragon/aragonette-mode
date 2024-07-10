import { type IFetchSnapshotVotingActivity } from "@/services/snapshot/params";
import { type SnapshotVotingActivityQueryResponse } from "@/services/snapshot/types";
import { getSnapshotVotingActivityData } from "@/services/snapshot/fetch";
import { type IProviderVotingActivity } from "@/server/client/types/domain";

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  const response = await getSnapshotVotingActivityData(params);
  return parseVotingActivity(response);
}

function parseVotingActivity(data: SnapshotVotingActivityQueryResponse): IProviderVotingActivity[] {
  return (
    data.votes?.map((vote) => ({
      id: vote.id,
      choice: vote.proposal.choices[Number(vote.choice) - 1],
      providerId: vote.proposal.id,
      createdAt: new Date(Number(vote.created) * 1000).toISOString(),
    })) ?? []
  );
}
