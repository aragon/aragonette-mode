import { type ProposalStatus } from "@aragon/ods";
import { type Address } from "viem";
import { type VotingData } from "../../providers/utils/types";

export enum ProposalStages {
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
  status: ProposalStatus;
  startTimestamp?: string;
  endTimestamp?: string;
  creator: ICreator[];
  link: string;
  voting?: VotingData;
}

export enum ProposalTracks {
  EMERGENCY = "Emergency",
  STANDARD = "Standard",
}

export interface IProposal {
  pip: string;
  title: string;
  description: string;
  status: ProposalStatus;
  type: string;
  isEmergency?: boolean;
  currentStage: ProposalStages;
  stages: IProposalStage[];
  actions?: string[];
}

export interface IProposalVote {
  id: string;
  address: Address;
  vote: string;
  amount: number;
  timestamp: string;
}

export interface IHasVoted {
  address: Address;
  hasVoted: boolean;
}
