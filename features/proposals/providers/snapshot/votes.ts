import { type IProposalVotesProvider, type IProposalVotingPowerProvider } from "../../models/proposals";
import { getSnapshotVotesData, getSnapshotVotingPowerData } from "@/services/snapshot";
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
