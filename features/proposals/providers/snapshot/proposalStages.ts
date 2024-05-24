import { type IProposalStageProvider, type IProposalStagesProvider } from "../../models/proposals";
import { snapshotProposalsQuery, snapshotProposalQuery } from "./gql";
import { type SnapshotProposalData } from "./types";
import { parseSnapshotData, parseSnapshotProposalData, requestProposalData } from "./utils";

export const getSnapshotProposalStagesData: IProposalStagesProvider = async function (params: { space: string }) {
  return requestProposalData(snapshotProposalsQuery(params.space))
    .then((res) => res.data.proposals as SnapshotProposalData[])
    .then(parseSnapshotData);
};

export const getSnapshotProposalStageData: IProposalStageProvider = async function (params: { providerId: string }) {
  return requestProposalData(snapshotProposalQuery(params.providerId))
    .then((res) => res.data.proposal as SnapshotProposalData | null)
    .then((data) => (data ? parseSnapshotProposalData(data) : null));
};
