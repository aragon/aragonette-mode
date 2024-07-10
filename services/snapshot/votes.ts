import { getSnapshotVotesData, getSnapshotVotingPowerData } from "@/services/snapshot/fetch";
import { type IProposalVotesProvider, type IProposalVotingPowerProvider } from "../../server/models/proposals/types";
import { type IFetchSnapshotVotesParams, type IFetchSnapshotVotingPowerParams } from "./params";
import { parseSnapshotVoteData } from "./utils";

export const getSnapshotVotes: IProposalVotesProvider = async function (params: IFetchSnapshotVotesParams) {
  return getSnapshotVotesData(params).then(parseSnapshotVoteData);
};

export const getSnapshotVotingPower: IProposalVotingPowerProvider = async function (
  params: IFetchSnapshotVotingPowerParams
) {
  return getSnapshotVotingPowerData(params).then((res) => res);
};
