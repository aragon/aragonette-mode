import { type ProposalStatus, type ProposalStages } from "@/features/proposals/services/proposal/domain";
import { type Action } from "@/utils/types";

export type ProposalCreatedLogResponse = {
  args: {
    actions: Action[];
    allowFailureMap: bigint;
    creator: string;
    endDate: bigint;
    startDate: bigint;
    metadata: string;
    proposalId: bigint;
  };
};

export type Metadata = {
  title: string;
  description: string;
  summary: string;
  resources: Array<{
    name: string;
    url: string;
  }>;
};

export type ProposalBindings = {
  githubId: string | undefined;
  snapshotId: string | undefined;
};

export type ProposalData = {
  active: boolean;
  approvals: number;
  parameters: ProposalParameters;
  actions: Array<Action>;
  allowFailureMap: bigint;
  executed: boolean;

  // new multisig data
  firstDelayStartBlock: bigint | null;
  confirmations: number;
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

export type MultiSigProposalVotingData = {
  startDate: string;
  endDate: string;
  approvals: number;
  quorum: number;
  snapshotBlock: string;
};

export type MultisigProposal = {
  id: ProposalStages;
  title: string;
  summary: string;
  description: string;
  creator: string;
  createdAt: string;
  link: string;
  status: ProposalStatus;
  voting?: MultiSigProposalVotingData;
  actions: Array<Action>;
  isEmergency: boolean;
  githubId?: string;
  snapshotId?: string;
};
