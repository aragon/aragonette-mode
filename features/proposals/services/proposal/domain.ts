import { type ProposalStatus } from "@aragon/ods";
import { type Address } from "viem";

export enum ProposalStage {
  DRAFT,
  COUNCIL_APPROVAL,
  COMMUNITY_VOTING,
  COUNCIL_CONFIRMATION,
}

export interface IProposalStage {
  id: ProposalStage;
  name: string;
  status: ProposalStatus;
  startTimestamp: string;
  endTimestamp: string;
  creator: string;
  link: string;
}

export enum ProposalTypes {
  CONTRACT = "CONTRACT",
  CORE = "CORE",
  CRITICAL = "CRITICAL",
  INFORMATIONAL = "INFORMATIONAL",
  INTERFACE = "INTERFACE",
}

export interface IProposal {
  id: string;
  title: string;
  description: string;
  status: string;
  actions: unknown[];
  type: ProposalTypes;
  currentStage: number;
  stages: IProposalStage[];
}

// TODO: TBD - Snapshot
export enum Votes {
  YES = "YES",
  NO = "NO",
}

export interface IProposalVote {
  address: Address;
  proposalId: string;
  stageId: ProposalStage;
  vote: Votes;
  weight: number;
}
