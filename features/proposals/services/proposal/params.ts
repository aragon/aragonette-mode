import { type Address } from "viem";
import { type ProposalStage, type Votes } from "./domain";

export interface IFetchProposalParams {
  proposalId: string;
}

export interface IFetchProposalListParams {}

export interface IVoteParams {
  address: Address;
  proposalId: string;
  stageId: ProposalStage;
  vote: Votes;
  weight: number;
}

export interface IFetchVotesParams {
  proposalId: string;
  stageId: ProposalStage;
}
