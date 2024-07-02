import { getSnapshotVotesData, getSnapshotVotingPowerData } from "@/services/snapshot/fetch";
import { type IProposalVotesProvider, type IProposalVotingPowerProvider } from "../../server/models/proposals/types";
import { parseSnapshotVoteData } from "./utils";

type GetSnapshotVotesParams = {
  space?: string;
  providerId?: string;
  voter?: string;
};

type GetSnapshotVotingPowerParams = {
  space: string;
  voter: string;
  providerId?: string;
};

export const getSnapshotVotes: IProposalVotesProvider = async function (params: GetSnapshotVotesParams) {
  return getSnapshotVotesData(params).then(parseSnapshotVoteData);
};

export const getSnapshotVotingPower: IProposalVotingPowerProvider = async function (
  params: GetSnapshotVotingPowerParams
) {
  return getSnapshotVotingPowerData(params).then((res) => res);
};
