import { ProposalStages, ProposalTypes } from "@/features/proposals/services/proposal/domain";

export type Vote = {
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
  status: string;
  creator: string;
  link: string;
  voting?: VotingData;
};

export type ProposalResponse = {
  pip: string;
  title: string;
  description: string;
  status: string;
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
  status: string;
  creator: string;
  link: string;
  type?: ProposalTypes;
  voting?: VotingData;
};

export type Proposal = {
  pip: string;
  title: string;
  description: string;
  status: string;
  type: ProposalTypes;
  currentStage: number;
  stages: ProposalStage[];
  actions?: string[];
};

export interface IProposalStageProvider {
  (params: any): Promise<ProposalStage[]>;
}
