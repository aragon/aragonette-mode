import { type IProposalVotesProvider } from "@/features/proposals/models/proposals";
import { type Address } from "viem";
import { parseMultisigVotesData, requestApprovalData, requestConfirmationData } from "./utils";

interface IGetMultisigApprovalDataParams {
  chain: number;
  contractAddress: Address;
  providerId: bigint;
}

interface IGetMultisigConfirmationDataParams extends IGetMultisigApprovalDataParams {}

export const getMultisigApprovalData: IProposalVotesProvider = async function (params: IGetMultisigApprovalDataParams) {
  return await requestApprovalData(params.chain, params.contractAddress, params.providerId).then(
    parseMultisigVotesData
  );
};

export const getMultisigConfirmationData: IProposalVotesProvider = async function (
  params: IGetMultisigConfirmationDataParams
) {
  return await requestConfirmationData(params.chain, params.contractAddress, params.providerId).then(
    parseMultisigVotesData
  );
};
