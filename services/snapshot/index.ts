import { SNAPSHOT_API_URL } from "@/constants";
import { snapshotVotesQuery, snapshotVotingPowerQuery, snapshotProposalsQuery, snapshotProposalQuery } from "./gql";
import { type SnapshotVoteData, type SnapshotVotingPowerData, type SnapshotProposalData } from "./types";

const requestProposalData = async function (query: string) {
  return fetch(SNAPSHOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());
};

export const getSnapshotProposalStagesData = async function (params: { space: string }) {
  return requestProposalData(snapshotProposalsQuery(params.space)).then(
    (res) => res.data.proposals as SnapshotProposalData[]
  );
};

export const getSnapshotProposalStageData = async function (params: { providerId: string }) {
  return requestProposalData(snapshotProposalQuery(params.providerId)).then(
    (res) => res.data.proposal as SnapshotProposalData | null
  );
};

export const getSnapshotVotesData = async function (params: { providerId: string }) {
  return requestProposalData(snapshotVotesQuery(params.providerId)).then((res) => res.data.votes as SnapshotVoteData[]);
};

export const getSnapshotVotingPowerData = async function (params: {
  space: string;
  providerId?: string;
  voter: string;
}) {
  return requestProposalData(snapshotVotingPowerQuery(params.space, params.voter, params.providerId)).then(
    (res) => res.data.vp as SnapshotVotingPowerData
  );
};
