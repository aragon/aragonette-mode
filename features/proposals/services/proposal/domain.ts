import { type ProposalStatus } from "@aragon/ods";
import { type Address } from "viem";

export enum ProposalStages {
  DRAFT,
  COUNCIL_APPROVAL,
  COMMUNITY_VOTING,
  COUNCIL_CONFIRMATION,
}

export interface IProposalStage {
  id: ProposalStages;
  status: ProposalStatus;
  startTimestamp: string;
  endTimestamp: string;
  creator: string;
  link: string;
}

export enum ProposalTypes {
  CONTRACTS = "Contracts",
  CORE = "Core",
  CRITICAL = "Critical",
  INFORMATIONAL = "Informational",
  INTERFACE = "Interface",
}

export interface IProposal {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  actions: unknown[];
  type: ProposalTypes;
  currentStage: number;
  stages: IProposalStage[];
}

// TODO: TBD - Snapshot
export enum Votes {
  YES = "Yes",
  NO = "No",
}

export interface IProposalVote {
  address: Address;
  proposalId: string;
  stageId: ProposalStages;
  vote: Votes;
  weight: number;
}
