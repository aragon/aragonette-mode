import { type IProposalStageProvider, type IProposalStagesProvider } from "../../models/proposals";
import { getSnapshotProposalStagesData, getSnapshotProposalStageData } from "@/services/snapshot";
import { parseSnapshotData, parseSnapshotProposalData } from "./utils";

export const getSnapshotProposalStages: IProposalStagesProvider = async function (params: { space: string }) {
  return getSnapshotProposalStagesData(params).then(parseSnapshotData);
};

export const getSnapshotProposalStage: IProposalStageProvider = async function (params: { providerId: string }) {
  return getSnapshotProposalStageData(params).then((data) => (data ? parseSnapshotProposalData(data) : null));
};
