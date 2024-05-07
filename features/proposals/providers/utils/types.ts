import {
  type ProposalStatus,
  type ICreator,
  type ProposalStages,
  type IProposalResource,
} from "@/features/proposals/services/proposal/domain";

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

export type ProposalStage = {
  id: ProposalStages;
  pip?: string;
  title: string;
  description: string;
  body: string;
  status: ProposalStatus;
  isEmergency?: boolean;
  createdAt?: string;
  creator: ICreator[];
  resources?: IProposalResource[];
  type?: string;
  voting?: VotingData;
  bindings?: {
    id: ProposalStages;
    link: string;
  }[];
};

export interface IProposalStageProvider {
  (params?: any): Promise<ProposalStage[]>;
}

export interface IProposalVotesProvider {
  (params?: any): Promise<Vote[]>;
}
