import {
  type IProposalStage,
  type ProposalStages,
  type ProposalTypes,
} from "@/features/proposals/services/proposal/domain";

export type ProposalStage = {
  id: number;
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

export interface IProposalStageProvider {
  (params: any): Promise<ProposalStage[]>;
}

export interface IProposalVotesProvider {
  (params: any): Promise<Vote[]>;
}
