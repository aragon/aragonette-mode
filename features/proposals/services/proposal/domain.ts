import { type IPublisher, type ProposalStatus as ODSProposalStatus } from "@aragon/ods";
import { type Address } from "viem";
import { type VotingScores } from "../../models/proposals";

export type ProposalStatus = ODSProposalStatus | "Last Call" | "Continuous" | "Stagnant" | "Peer Review";

export enum ProposalStages {
  DRAFT = "Draft",
  COUNCIL_APPROVAL = "Protocol Council Approval",
  COMMUNITY_VOTING = "gPOL Community Voting",
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

export type IProposalResource = {
  name: string;
  link: string;
};

export interface IVotingData {
  providerId: string;
  startDate: string;
  endDate: string;
  choices: string[];
  snapshotBlock: string;
  quorum: number;
  scores: VotingScores[];
  total_votes: number;
}

export interface IProposalStage {
  id: string;
  type: ProposalStages;
  status: ProposalStatus;
  createdAt?: string;
  startTimestamp?: string;
  endTimestamp?: string;
  creator: ICreator[];
  resources: IProposalResource[];
  voting?: IVotingData;
}

export enum ProposalTracks {
  EMERGENCY = "Emergency",
  STANDARD = "Standard",
}

export interface IAction {
  to: string;
  value: string;
  data: string;
}

export interface IProposal {
  id: string;
  title: string;
  description: string;
  body?: string;
  transparencyReport?: string;
  resources: IProposalResource[];
  includedPips: IProposalResource[];
  parentPip?: IProposalResource;
  status: ProposalStatus;
  createdAt?: string;
  type: string;
  isEmergency?: boolean;
  currentStage: ProposalStages;
  stages: IProposalStage[];
  actions: IAction[];
  publisher: IPublisher[];
}

export interface IProposalVote {
  id: string;
  address: Address;
  vote: string;
  amount: number;
  timestamp: string;
}

export interface IVoted {
  address: Address;
  hasVoted: boolean;
}

export interface ICanVote {
  address: Address;
  canVote: boolean;
  vp: number;
}

export enum Votes {
  YES = "Yes",
  NO = "No",
}
