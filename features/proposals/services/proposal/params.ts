import { type Address } from "viem";
import { type ProposalStages, type Votes } from "./domain";

export interface IFetchProposalParams {
  proposalId: string;
}

export interface IFetchProposalListParams {}

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
