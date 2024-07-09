import { getSnapshotProposalStageData, getSnapshotProposalStagesData } from "@/services/snapshot/fetch";
import { type IProposalStageProvider, type IProposalStagesProvider } from "../../server/models/proposals/types";
import { type IFetchSnapshotProposalStageParams, type IFetchSnapshotProposalStagesParams } from "./params";
import { parseSnapshotData, parseSnapshotProposalData } from "./utils";

export const getSnapshotProposalStages: IProposalStagesProvider = async function (
  params: IFetchSnapshotProposalStagesParams
) {
  return getSnapshotProposalStagesData(params).then(parseSnapshotData);
};

export const getSnapshotProposalStage: IProposalStageProvider = async function (
  params: IFetchSnapshotProposalStageParams
) {
  return getSnapshotProposalStageData(params).then((data) => (data ? parseSnapshotProposalData(data) : null));
};
