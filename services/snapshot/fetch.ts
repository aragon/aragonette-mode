import { SNAPSHOT_API_URL } from "@/constants";
import { logger } from "../logger";
import {
  snapshotProposalQuery,
  snapshotProposalsQuery,
  snapshotVotesQuery,
  snapshotVotingActivityQuery,
  snapshotVotingPowerQuery,
} from "./gql";
import { type IFetchSnapshotVotingActivity } from "./params";
import {
  type SnapshotProposalData,
  type SnapshotVoteData,
  type SnapshotVotingActivityQueryResponse,
  type SnapshotVotingPowerData,
} from "./types";

const requestProposalData = async function (query: string) {
  try {
    return fetch(SNAPSHOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }).then((response) => response.json());
  } catch (err) {
    logger.error(`Failed to fetch Snapshot. URL: ${SNAPSHOT_API_URL}, Query: ${query}, Err:`, err);
    throw new Error(`Failed to fetch Snapshot`);
  }
};

export const getSnapshotProposalStagesData = async function (params: { space: string }) {
  logger.info(`Fetching Snapshot proposal list for space (${params.space})...`);
  return requestProposalData(snapshotProposalsQuery(params.space)).then(
    (res) => res.data.proposals as SnapshotProposalData[]
  );
};

export const getSnapshotProposalStageData = async function (params: { providerId: string }) {
  logger.info(`Fetching Snapshot proposal for proposalId (${params.providerId})...`);
  return requestProposalData(snapshotProposalQuery(params.providerId)).then(
    (res) => res.data.proposal as SnapshotProposalData | null
  );
};

export const getSnapshotVotesData = async function (params: { providerId: string }) {
  logger.info(`Fetching Snapshot votes for proposalId (${params.providerId})...`);
  return requestProposalData(snapshotVotesQuery(params.providerId)).then((res) => res.data.votes as SnapshotVoteData[]);
};

export const getSnapshotVotingPowerData = async function (params: {
  space: string;
  providerId?: string;
  voter: string;
}) {
  if (params.providerId) {
    logger.info(
      `Fetching Snapshot voting power for delegate (${params.voter}) for proposalId (${params.providerId})...`
    );
  } else {
    logger.info(`Fetching Snapshot voting power for delegate (${params.voter})...`);
  }

  return requestProposalData(snapshotVotingPowerQuery(params.space, params.voter, params.providerId)).then(
    (res) => (res.data.vp as SnapshotVotingPowerData)?.vp ?? 0
  );
};

export async function getSnapshotVotingActivityData(params: IFetchSnapshotVotingActivity) {
  logger.info(`Fetching Snapshot voting activity for delegate (${params.voter})...`);
  return requestProposalData(snapshotVotingActivityQuery(params)).then(
    (res) => res.data.votes as SnapshotVotingActivityQueryResponse
  );
}
