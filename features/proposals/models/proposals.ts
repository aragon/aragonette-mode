import {
  type ProposalStatus,
  type ICreator,
  type ProposalStages,
  type IProposalResource,
} from "@/features/proposals/services/proposal/domain";
import { type Action } from "@/utils/types";

export type Vote = {
  id: string;
  choice: string;
  voter: string;
  amount: string;
  timestamp: string;
};

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
};

export type ProposalStage = {
  stageType: ProposalStages;
  pip?: string;
  parentPip?: IProposalResource;
  includedPips?: IProposalResource[];
  title: string;
  description: string;
  body: string;
  transparency_report?: string;
  status: ProposalStatus;
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
