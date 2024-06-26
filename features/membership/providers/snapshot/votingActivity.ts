import { logger } from "@/services/logger";
import { snapshotVotingActivityQuery } from "./gql";
import { type IFetchSnapshotVotingActivity } from "./params";
import { type SnapshotVotingActivityQueryResponse } from "./types";
import { fetchSnapshotData } from "./utils";
import { type IProviderVotingActivity } from "../../services/members/domain";

export async function getSnapshotVotingActivity(params: IFetchSnapshotVotingActivity) {
  try {
    logger.info(`Fetching Snapshot voting activity for delegate: ${params.voter}...`);
    const response = await fetchSnapshotData<SnapshotVotingActivityQueryResponse>(snapshotVotingActivityQuery(params));

    logger.info(`Returning Snapshot voting activity...`);
    return parseVotingActivity(response);
  } catch (err) {
    logger.error(`Failed to fetch Snapshot voting activity:`, err);
    throw err;
  }
}

function parseVotingActivity(data: SnapshotVotingActivityQueryResponse): IProviderVotingActivity[] {
  return data.votes.map((vote) => ({
    id: vote.id,
    choice: vote.proposal.choices[Number(vote.choice) - 1],
    providerId: vote.proposal.id,
    createdAt: new Date(Number(vote.created) * 1000).toISOString(),
  }));
}
