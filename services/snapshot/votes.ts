import { type IProposalVotesProvider, type IProposalVotingPowerProvider } from "../../server/models/proposals/types";
import { getSnapshotVotesData, getSnapshotVotingPowerData } from "@/services/snapshot/fetch";
import { parseSnapshotVoteData } from "./utils";

export const getSnapshotVotes: IProposalVotesProvider = async function (params: { providerId: string }) {
  return getSnapshotVotesData(params).then(parseSnapshotVoteData);
};

export const getSnapshotVotingPower: IProposalVotingPowerProvider = async function (params: {
  space: string;
  providerId?: string;
  voter: string;
}) {
  return getSnapshotVotingPowerData(params).then((res) => res.vp);
};
