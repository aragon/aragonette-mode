import { type SnapshotVoteData } from "@/services/snapshot/types";
import { getSnapshotVotesData } from "@/services/snapshot/fetch";
import { type IProviderVotingActivity } from "@/server/client/types/domain";

export type IFetchSnapshotVotingActivity = {
  space: string;
  voter: string;
  page?: number;
  limit?: number;
};

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  const response = await getSnapshotVotesData(params);
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
