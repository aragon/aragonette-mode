import { getAllSnapshotVotesData, getSnapshotVotesData, getSnapshotVotingPowerData } from "@/services/snapshot/fetch";
import { type IProposalVotesProvider, type IProposalVotingPowerProvider } from "../../server/models/proposals/types";
import { parseSnapshotVoteData } from "./utils";
import { type IFetchPaginatedParams } from "@/utils/types";

interface IFetchPaginatedSnapshotVotesParams extends IFetchPaginatedParams {
  space: string;
  providerId?: string;
  voter?: string;
}

export const getSnapshotVotes: IProposalVotesProvider = async function (params: IFetchPaginatedSnapshotVotesParams) {
  return getSnapshotVotesData(params).then(parseSnapshotVoteData);
};

interface IFetchSnapshotVotesParams {
  space: string;
  providerId?: string;
  voter?: string;
}

export const getAllSnapshotVotes: IProposalVotesProvider = async function (params: IFetchSnapshotVotesParams) {
  return getAllSnapshotVotesData(params).then(parseSnapshotVoteData);
};

interface IFetchSnapshotVotingPowerParams {
  space: string;
  voter: string;
  providerId?: string;
}

export const getSnapshotVotingPower: IProposalVotingPowerProvider = async function (
  params: IFetchSnapshotVotingPowerParams
) {
  return getSnapshotVotingPowerData(params).then((res) => res);
};
