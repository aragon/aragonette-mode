import { ProposalStages, ProposalTypes } from "@/features/proposals/services/proposal/domain";
import { ProposalStatus } from "@aragon/ods";

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
  startDate: string;
  endDate: string;
  choices: string[];
  snapshotBlock: string;
  quorum: number;
  scores: VotingScores[];
  total_votes: number;
};

export type ProposalStageResponse = {
  id: string;
  status: ProposalStatus;
  creator: string;
  link: string;
  voting?: VotingData;
};

export type ProposalResponse = {
  pip: string;
  title: string;
  description: string;
  status: ProposalStatus;
  type: ProposalTypes;
  currentStage: number;
  stages: ProposalStageResponse[];
  actions?: string[];
};

export type ProposalStage = {
  id: ProposalStages;
  pip?: string;
  title: string;
  description: string;
  body: string;
  status: ProposalStatus;
  creator: string;
  link: string;
  type?: ProposalTypes;
  voting?: VotingData;
  bindings?: {
    id: ProposalStages;
    link: string;
  }[];
};

export type Proposal = {
  pip: string;
  title: string;
  description: string;
  status: ProposalStatus;
  type: ProposalTypes;
  currentStage: number;
  stages: ProposalStage[];
  actions?: string[];
};

export interface IProposalStageProvider {
  (params?: any): Promise<ProposalStage[]>;
}

export interface IProposalVotesProvider {
  (params?: any): Promise<Vote[]>;
}
