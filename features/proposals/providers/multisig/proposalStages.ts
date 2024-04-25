import { IProposalStageProvider } from "@/features/proposals/providers/utils/types";
import { requestProposalData, parseMultisigData } from "./utils";
import { Address } from "viem";

interface IGetMultisigProposalStagesDataParams {
  chain: number;
  contractAddress: Address;
}

export const getMultisigProposalData: IProposalStageProvider = async function (
  params: IGetMultisigProposalStagesDataParams
) {
  const data = await requestProposalData(params.chain, params.contractAddress);
  return parseMultisigData(data);
};
