import { type IProposalStageProvider } from "@/features/proposals/models/proposals";
import { requestProposalData, parseMultisigData } from "./utils";
import { type Address } from "viem";

interface IGetMultisigProposalStagesDataParams {
  chain: number;
  contractAddress: Address;
}

export const getMultisigProposalData: IProposalStageProvider = async function (
  params: IGetMultisigProposalStagesDataParams
) {
  return requestProposalData(params.chain, params.contractAddress).then(parseMultisigData);
};
