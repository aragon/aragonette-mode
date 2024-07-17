import { getSnapshotProposalStageData, getSnapshotProposalStagesData } from "@/services/snapshot/fetch";
import { type IProposalStageProvider, type IProposalStagesProvider } from "../../server/models/proposals/types";
import { parseSnapshotData, parseSnapshotProposalData } from "./utils";

export interface IFetchSnapshotProposalStagesParams {
  space: string;
}

export const getSnapshotProposalStages: IProposalStagesProvider = async function (
  params: IFetchSnapshotProposalStagesParams
) {
  return getSnapshotProposalStagesData(params).then(parseSnapshotData);
};

export interface IFetchSnapshotProposalStageParams {
  providerId: string;
}

export const getSnapshotProposalStage: IProposalStageProvider = async function (
  params: IFetchSnapshotProposalStageParams
) {
  return getSnapshotProposalStageData(params).then((data) => (data ? parseSnapshotProposalData(data) : null));
};
