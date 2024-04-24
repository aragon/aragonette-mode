import { type ProposalStatus } from "@aragon/ods";
import { type Address } from "viem";
import { type VotingData } from "../../providers/utils/types";

export enum ProposalStages {
  DRAFT,
  COUNCIL_APPROVAL,
  COMMUNITY_VOTING,
  COUNCIL_CONFIRMATION,
}

export enum ProposalStageTitles {
  DRAFT = "Draft",
  COUNCIL_APPROVAL = "Protocol Council Approval",
  COMMUNITY_VOTING = "Community Voting",
  COUNCIL_CONFIRMATION = "Protocol Council Confirmation",
}

export interface ICreator {
  name?: string;
  link?: string;
}

export interface IProposalStage {
  id: ProposalStages;
  title: ProposalStageTitles;
  status: ProposalStatus;
  startTimestamp?: string;
  endTimestamp?: string;
  creator: ICreator[];
  link: string;
  voting?: VotingData;
}

export enum ProposalTypes {
  CONTRACTS = "Contracts",
  CORE = "Core",
  INFORMATIONAL = "Informational",
  INTERFACE = "Interface",
}

export enum ProposalTracks {
  EMERGENCY = "Emergency",
  STANDARD = "Standard",
}

export interface IProposal {
  pip: string;
  title: string;
  description: string;
  status: string;
  type: ProposalTypes;
  isEmergency?: boolean;
  currentStage: number;
  stages: IProposalStage[];
  actions?: string[];
}

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
