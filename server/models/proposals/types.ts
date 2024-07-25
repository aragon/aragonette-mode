import {
  type ProposalStatus,
  type ICreator,
  type IProposalResource,
  type StageStatus,
} from "@/features/proposals/services/domain";
import { type Action } from "@/utils/types";

export type Vote = {
  id: string;
  choice: string;
  voter: string;
  amount: string;
  timestamp: string;
  reason?: string;
};

export enum ProposalStages {
  DRAFT = "Draft",
  TRANSPARENCY_REPORT = "Transparency Report",
  COUNCIL_APPROVAL = "Protocol Council Approval",
  COMMUNITY_VOTING = "Community Voting",
  COUNCIL_CONFIRMATION = "Protocol Council Confirmation",
}

export type VotingScores = {
  choice: string;
  votes: number;
  percentage: number;
};

export type VotingData = {
  providerId: string;
  startDate: Date;
  endDate: Date;
  choices: string[];
  snapshotBlock: string;
  quorum: number;
  scores: VotingScores[];
  total_votes: number;
  status: StageStatus;
  overallStatus: ProposalStatus;
};

export type ProposalStage = {
  stageType: ProposalStages;
  pip?: string;
  parentPip?: IProposalResource;
  includedPips?: IProposalResource[];
  title: string;
  description: string;
  body: string;
  status: StageStatus;
  overallStatus: ProposalStatus;
  statusMessage?: string;
  isEmergency?: boolean;
  createdAt?: Date;
  creator: ICreator[];
  resources: IProposalResource[];
  type?: string;
  voting?: VotingData;
  bindings: {
    id: ProposalStages;
    link: string;
  }[];
  actions: Action[];
};

export interface IProposalStagesProvider {
  (params?: any): Promise<ProposalStage[]>;
}

export interface IProposalStageProvider {
  (params?: any): Promise<ProposalStage | null>;
}

export interface IProposalVotesProvider {
  (params?: any): Promise<Vote[]>;
}

export interface IProposalVotingPowerProvider {
  (params?: any): Promise<number>;
}

export interface IProposalVotingDataProvider {
  (params?: any): Promise<VotingData | undefined>;
}
