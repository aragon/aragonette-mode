import { type IProposalStageProvider } from "../utils/types";
import { snapshotProposalsQuery } from "./gql";
import { type SnapshotProposalData } from "./types";
import { parseSnapshotData, requestProposalData } from "./utils";

export const getSnapshotProposalStagesData: IProposalStageProvider = async function (params: { space: string }) {
  return requestProposalData(snapshotProposalsQuery(params.space))
    .then((res) => res.data.proposals as SnapshotProposalData[])
    .then(parseSnapshotData);
};
