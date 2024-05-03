import { type Address } from "viem";
import { type VotingData } from "../../providers/utils/types";
import { type ProposalStatus as ODSProposalStatus } from "@aragon/ods";

export type ProposalStatus = ODSProposalStatus | "Last Call" | "Continuous" | "Stagnant" | "Peer Review";

export enum ProposalStages {
  DRAFT = "Draft",
  COUNCIL_APPROVAL = "Protocol Council Approval",
  COMMUNITY_VOTING = "vePOL Community Voting",
  COUNCIL_CONFIRMATION = "Protocol Council Confirmation",
}

export const StageOrder = {
  [ProposalStages.DRAFT]: 0,
  [ProposalStages.COUNCIL_APPROVAL]: 1,
  [ProposalStages.COMMUNITY_VOTING]: 2,
  [ProposalStages.COUNCIL_CONFIRMATION]: 3,
} as const;

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
