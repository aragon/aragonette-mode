import { type Address } from "viem";
import { type ProposalStatus, type ProposalStages, type Votes } from "./domain";
import { type ProposalSortBy, type ProposalSortDir } from "../../repository/proposal";

export interface IFetchProposalParams {
  proposalId: string;
}

export interface IFetchProposalListParams {
  page?: number;
  limit?: number;
  sortBy?: ProposalSortBy;
  sortDir?: ProposalSortDir;
  search?: string;
  status?: ProposalStatus;
}

export interface IVoteParams {
  address: Address;
  proposalId: string;
  stage: ProposalStages;
  vote: Votes;
  weight: number;
}

export interface IFetchVotesParams {
  proposalId: string;
  stage: ProposalStages;
}

export interface IFetchVotedParams {
  proposalId: string;
  stage: ProposalStages;
  address: Address;
}
