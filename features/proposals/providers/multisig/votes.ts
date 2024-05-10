import { IProposalVotesProvider } from "@/features/proposals/providers/utils/types";
import { requestVotesData, parseMultisigVotesData } from "./utils";
import { type Address } from "viem";

interface IGetMultisigVotesDataParams {
  chain: number;
  contractAddress: Address;
  providerId: bigint;
}

export const getMultisigVotesData: IProposalVotesProvider = async function (params: IGetMultisigVotesDataParams) {
  return await requestVotesData(params.chain, params.contractAddress, params.providerId).then(parseMultisigVotesData);
};
