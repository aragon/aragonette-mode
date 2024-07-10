import { type SnapshotVoteData } from "@/services/snapshot/types";
import { getSnapshotVotesData } from "@/services/snapshot/fetch";
import { type IProviderVotingActivity } from "@/server/client/types/domain";
import { type IFetchPaginatedParams } from "@/utils/types";

export interface IFetchSnapshotVotingActivity extends IFetchPaginatedParams {
  space: string;
  voter: string;
}

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  // TODO: paginate snapshot voting activity if necessary
  const response = await getSnapshotVotesData({ ...params, limit: params.limit ?? 1000 });
  return parseVotingActivity(response);
}

function parseVotingActivity(data: SnapshotVoteData[]): IProviderVotingActivity[] {
  return (
    data.map((vote) => ({
      id: vote.id,
      choice: vote.proposal.choices[Number(vote.choice) - 1],
      providerId: vote.proposal.id,
      createdAt: new Date(Number(vote.created) * 1000).toISOString(),
    })) ?? []
  );
}
