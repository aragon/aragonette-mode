import { type Address } from "viem";
import { type ProposalStatus, type ProposalStages } from "./domain";
import { type ProposalSortBy, type ProposalSortDir } from "../../../../server/models/proposals";
import { type IFetchPaginatedParams } from "@/utils/types";

export interface IFetchProposalParams {
  proposalId: string;
}

export interface IFetchProposalListParams extends IFetchPaginatedParams {
  sortBy?: ProposalSortBy;
  sortDir?: ProposalSortDir;
  search?: string;
  status?: ProposalStatus;
}

export interface IFetchVotesParams extends IFetchPaginatedParams {
  proposalId: string;
  stage: ProposalStages;
}

export interface IFetchVotedParams {
  proposalId: string;
  stage: ProposalStages;
  address: Address;
}

export interface IFetchCanVoteParams {
  proposalId: string;
  stage: ProposalStages;
  address: Address;
}
