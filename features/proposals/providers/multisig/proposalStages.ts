import { type IProposalStagesProvider, type IProposalVotingDataProvider } from "@/features/proposals/models/proposals";
import {
  requestProposalsData,
  requestProposalData,
  requestVotingData,
  parseMultisigData,
  parseVotingData,
} from "./utils";
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

interface IGetMultisigProposalStageDataParams {
  chain: number;
  contractAddress: Address;
  proposalId: number;
}

export const getMultisigProposalData: IProposalStagesProvider = async function (
  params: IGetMultisigProposalStageDataParams
) {
  return requestProposalData(params.chain, params.contractAddress, params.proposalId).then(parseMultisigData);
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
