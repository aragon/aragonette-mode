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

const requestSnapshotData = async function <T>(
  func: string,
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    return fetch(SNAPSHOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    })
      .then((response) => response.json())
      .then((res) => res.data[func] as T);
  } catch (err) {
    logger.error(
      `Failed to fetch Snapshot. URL: ${SNAPSHOT_API_URL}, Query: ${query}, Vars: ${JSON.stringify(variables)} Err:`,
      JSON.stringify(err)
    );
    throw new Error(`Failed to fetch Snapshot`);
  }
};

const requestPaginatedSnapshotData = async function <T>(
  func: string,
  query: string,
  variables?: Record<string, any>
): Promise<T[]> {
  const data: T[][] = [];
  let skip = 0;
  const pageSize = 1000;

  do {
    const variablesWithPagination = { ...variables, skip, first: pageSize };

    const pageData = await requestSnapshotData<T[]>(func, query, variablesWithPagination);

    skip += pageSize;
    data.push(pageData);
  } while (data.length % pageSize === 0);

  return data.flat();
};

export const getSnapshotProposalStagesData = async function (params: { space: string }) {
  logger.info(`Fetching Snapshot proposal list for space (${params.space})...`);
  return requestPaginatedSnapshotData<SnapshotProposalData>("proposals", snapshotProposalsQuery, {
    space: params.space,
  });
};

export const getSnapshotProposalStageData = async function (params: { providerId: string }) {
  logger.info(`Fetching Snapshot proposal for proposalId (${params.providerId})...`);
  return requestSnapshotData<SnapshotProposalData | null>("proposal", snapshotProposalQuery, { id: params.providerId });
};

type IGetSnapshotVotesDataParams = {
  space?: string;
  providerId?: string;
  voter?: string;
};

export const getSnapshotVotesData = async function (params: IGetSnapshotVotesDataParams) {
  logger.info(`Fetching Snapshot votes for proposalId (${params.providerId})...`);
  return requestPaginatedSnapshotData<SnapshotVoteData>("votes", snapshotVotesQuery, {
    space: params.space,
    proposal: params.providerId,
    voter: params.voter,
  });
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

  return requestSnapshotData<SnapshotVotingPowerData>("vp", snapshotVotingPowerQuery, {
    space: params.space,
    voter: params.voter,
    proposal: params.providerId,
  }).then((res) => res?.vp ?? 0);
};

export interface IGetSnapshotVotingActivityDataParams {
  space?: string;
  providerId?: string;
  voter?: string;
}

export async function getSnapshotVotingActivityData(params: IGetSnapshotVotingActivityDataParams) {
  logger.info(`Fetching Snapshot voting activity for delegate (${params.voter})...`);

  return requestPaginatedSnapshotData<SnapshotVotingActivityQueryResponse>("votes", snapshotVotingActivityQuery, {
    space: params.space,
    proposal: params.providerId,
    voter: params.voter,
  });
}
