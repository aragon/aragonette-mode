import { type Action } from "@/utils/types";
import { type ProposalStages } from "@/features/proposals/services/proposal/domain";
import { type ProposalStatus } from "@aragon/ods";

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

export type ProposalParameters = {
  minApprovals: number;
  snapshotBlock: bigint;
  startDate: bigint;
  endDate: bigint;

  // new multisig data
  delayDuration?: bigint;
  emergency: boolean;
  emergencyMinApprovals?: bigint;
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
  link: string;
  status: ProposalStatus;
  voting?: MultiSigProposalVotingData;
  actions: Array<Action>;
  githubId?: string;
  snapshotId?: string;
};
