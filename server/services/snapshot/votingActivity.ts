import { logger } from "@/services/logger";
import { type IFetchSnapshotVotingActivity } from "@/server/services/snapshot/params";
import {
  type SnapshotVotingActivity,
  type SnapshotVotingActivityQueryResponse,
} from "@/server/services/snapshot/types";
import { getSnapshotVotingActivityData } from "@/server/services/snapshot/fetch";

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  try {
    logger.info(`Fetching Snapshot voting activity for delegate: ${params.voter}...`);
    const response = await getSnapshotVotingActivityData(params);

    logger.info(`Returning Snapshot voting activity...`);
    return parseVotingActivity(response);
  } catch (err) {
    logger.error(`Failed to fetch Snapshot voting activity:`, err);
    throw err;
  }
}

function parseVotingActivity(data: SnapshotVotingActivityQueryResponse): SnapshotVotingActivity[] {
  return data.votes.map((vote) => ({
    id: vote.id,
    choice: vote.proposal.choices[Number(vote.choice) - 1],
    proposalId: vote.proposal.id,
    createdAt: new Date(Number(vote.created) * 1000).toISOString(),
  }));
}
