import { type IProposalStageProvider } from "@/features/proposals/providers/utils/types";
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
