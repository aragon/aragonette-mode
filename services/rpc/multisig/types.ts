import {
  type ProposalStages,
  type ProposalStatus,
  type StageStatus,
  type IProposalResource,
} from "@/features/proposals/services/domain";
import { type Action } from "@/utils/types";
import { type Address } from "viem";

export type ProposalCreatedLogResponse = {
  actions: Action[];
  allowFailureMap: bigint;
  creator: string;
  endDate: bigint;
  startDate: bigint;
  metadata: string;
  secondaryMetadata: string;
  proposalId: bigint;
};

export type PrimaryMetadata = {
  title: string;
  description: string;
  summary: string;
  resources: Array<{
    name: string;
    url: string;
  }>;
};

export type SecondaryMetadata = {
  resources: Array<{
    name: string;
    url: string;
  }>;
};

export type ProposalBindings = {
  githubId: string | undefined;
  snapshotId: string | undefined;
};

export type ProposalCreationData =
  | {
      metadata: string;
      creator: string;
      tx: any;
      block: any;
    }
  | void
  | undefined;

export type ProposalParameters = {
  minApprovals: number;
  snapshotBlock: bigint;
  startDate: bigint;
  endDate: bigint;

  // new multisig data
  delayDuration: bigint;
  emergency: boolean;
  emergencyMinApprovals: bigint;
};

export type ProposalData = {
  approvals: number;
  parameters: ProposalParameters;
  actions: Array<Action>;
  allowFailureMap: bigint;
  executed: boolean;
  primaryMetadata: string;
  secondaryMetadata: string | undefined;
  firstDelayStartTimestamp: bigint | null;
  confirmations: number;
};

export type MultiSigProposalVotingData = {
  providerId: string;
  startDate: string;
  endDate: string;
  approvals: number;
  quorum: number;
  snapshotBlock: string;
  status: StageStatus;
  overallStatus: ProposalStatus;
};

export type MultisigProposal = {
  stageType: ProposalStages;
  title: string;
  summary: string;
  description: string;
  creator: string;
  createdAt: string;
  resources: IProposalResource[];
  link: string;
  status: StageStatus;
  overallStatus: ProposalStatus;
  voting?: MultiSigProposalVotingData;
  actions: Action[];
  isEmergency: boolean;
  githubId?: string;
  transparencyReportId?: string;
  snapshotId?: string;
};

export type ApprovedLogResponse = {
  proposalId: bigint;
  approver: Address;
};

export type ConfirmedLogResponse = {
  proposalId: bigint;
  approver: Address;
};

export type VotesData = {
  logData: ApprovedLogResponse;
  tx: string;
  blockTimestamp: string;
};
