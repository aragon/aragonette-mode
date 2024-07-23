import { type IPublisher } from "@aragon/ods";
import { type Address } from "viem";
import { type VotingScores } from "../../../server/models/proposals/types";
import { type IResource } from "@/utils/types";

export enum ProposalStages {
  DRAFT = "Draft",
  TRANSPARENCY_REPORT = "Transparency Report",
  COUNCIL_APPROVAL = "Protocol Council Approval",
  COMMUNITY_VOTING = "Community Voting",
  COUNCIL_CONFIRMATION = "Protocol Council Confirmation",
}

export const printStageParam = (stage: ProposalStages): string => {
  switch (stage) {
    case ProposalStages.DRAFT:
      return "draft";
    case ProposalStages.TRANSPARENCY_REPORT:
      return "transparency-report";
    case ProposalStages.COUNCIL_APPROVAL:
      return "council-approval";
    case ProposalStages.COMMUNITY_VOTING:
      return "community-voting";
    case ProposalStages.COUNCIL_CONFIRMATION:
      return "council-confirmation";
    default:
      throw new Error("Invalid stage");
  }
};

export enum ProposalStatus {
  ACTIVE = "ACTIVE",
  ACCEPTED = "ACCEPTED",
  PENDING = "PENDING",
  EXECUTED = "EXECUTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export enum StageStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const StageOrder = {
  [ProposalStages.DRAFT]: 0,
  [ProposalStages.TRANSPARENCY_REPORT]: 1,
  [ProposalStages.COUNCIL_APPROVAL]: 2,
  [ProposalStages.COMMUNITY_VOTING]: 3,
  [ProposalStages.COUNCIL_CONFIRMATION]: 4,
} as const;

export interface ICreator {
  name?: string;
  link?: string;
}

export interface IProposalResource extends IResource {}

export interface IVotingData {
  providerId: string;
  isActive: boolean;
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
  status: StageStatus;
  statusMessage?: string;
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
  statusMessage?: string;
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
  reason?: string;
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

export interface IVotingPower {
  address: Address;
  vp: number;
}

export enum Votes {
  YES = "Yes",
  NO = "No",
}
