import { type ProposalStatus } from "@aragon/ods";
import { type Address } from "viem";
import { type VotingData } from "../../providers/utils/types";

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

export enum Votes {
  YES = "Yes",
  NO = "No",
}
export interface IProposalVote {
  address: Address;
  proposalId: string;
  stageId: ProposalStages;
  vote: Votes;
  weight: number;
}
