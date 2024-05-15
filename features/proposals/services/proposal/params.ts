import { type Address } from "viem";
import { type ProposalStages, type Votes } from "./domain";

export interface IFetchProposalParams {
  proposalId: string;
}

export interface IFetchProposalListParams {}

export interface IVoteParams {
  address: Address;
  proposalId: string;
  stageId: ProposalStages;
  vote: Votes;
  weight: number;
}

export interface IFetchVotesParams {
  proposalId: string;
  stageId: ProposalStages;
}

export interface IFetchVotedParams {
  proposalId: string;
  stageId: ProposalStages;
  address: Address;
}
