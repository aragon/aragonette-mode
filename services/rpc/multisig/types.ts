import {
  type ProposalStages,
  type ProposalStatus,
  type StageStatus,
  type IProposalResource,
} from "@/features/proposals/services/proposal/domain";
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

  // new multisig data
  primaryMetadata: string;
  secondaryMetadata: string | undefined;
  firstDelayStartTimestamp: bigint | null;
  confirmations: number;
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
