import { type IProposalStagesProvider, type IProposalVotingDataProvider } from "@/features/proposals/models/proposals";
import { requestProposalsData, requestVotingData, parseMultisigData, parseVotingData } from "./utils";
import { type Address } from "viem";

interface IGetMultisigProposalStagesDataParams {
  chain: number;
  contractAddress: Address;
}

export const getMultisigProposalsData: IProposalStagesProvider = async function (
  params: IGetMultisigProposalStagesDataParams
) {
  return requestProposalsData(params.chain, params.contractAddress).then(parseMultisigData);
};

interface IGetMultisigVotingDataParams {
  chain: number;
  contractAddress: Address;
  stage: "approval" | "confirmation";
  providerId: number;
}

export const getMultisigVotingData: IProposalVotingDataProvider = async function (
  params: IGetMultisigVotingDataParams
) {
  return requestVotingData(params.chain, params.contractAddress, params.stage, params.providerId).then((data) => {
    return parseVotingData(data);
  });
};
