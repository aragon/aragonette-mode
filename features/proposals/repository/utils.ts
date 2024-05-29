import { Proposal, Stage, StageType, ProposalStatus as ProposalStatusDb } from "@prisma/client";

import { IProposal } from "..";
import { ProposalStatus, ProposalStages, IProposalStage } from "../services/proposal/domain";

const sererializeType = (type: ProposalStages): StageType => {
  switch (type) {
    case ProposalStages.DRAFT:
      return StageType.DRAFT;
    case ProposalStages.COUNCIL_APPROVAL:
      return StageType.COUNCIL_APPROVAL;
    case ProposalStages.COMMUNITY_VOTING:
      return StageType.COMMUNITY_VOTING;
    case ProposalStages.COUNCIL_CONFIRMATION:
      return StageType.COUNCIL_CONFIRMATION;
  }
};

const parseType = (type: StageType): ProposalStages => {
  switch (type) {
    case StageType.DRAFT:
      return ProposalStages.DRAFT;
    case StageType.COUNCIL_APPROVAL:
      return ProposalStages.COUNCIL_APPROVAL;
    case StageType.COMMUNITY_VOTING:
      return ProposalStages.COMMUNITY_VOTING;
    case StageType.COUNCIL_CONFIRMATION:
      return ProposalStages.COUNCIL_CONFIRMATION;
  }
};

const serializeStatus = (status: ProposalStatus): ProposalStatusDb => {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return ProposalStatusDb.ACTIVE;
    case ProposalStatus.CANCELLED:
      return ProposalStatusDb.CANCELLED;
    case ProposalStatus.APPROVED:
      return ProposalStatusDb.APPROVED;
    case ProposalStatus.EXECUTED:
      return ProposalStatusDb.EXECUTED;
    case ProposalStatus.PENDING:
      return ProposalStatusDb.PENDING;
    case ProposalStatus.REJECTED:
      return ProposalStatusDb.REJECTED;
    case ProposalStatus.EXPIRED:
      return ProposalStatusDb.EXPIRED;
    case ProposalStatus.QUEUED:
      return ProposalStatusDb.QUEUED;
  }
};

const parseStatus = (status: ProposalStatusDb): ProposalStatus => {
  switch (status) {
    case ProposalStatusDb.ACTIVE:
      return ProposalStatus.ACTIVE;
    case ProposalStatusDb.CANCELLED:
      return ProposalStatus.CANCELLED;
    case ProposalStatusDb.APPROVED:
      return ProposalStatus.APPROVED;
    case ProposalStatusDb.EXECUTED:
      return ProposalStatus.EXECUTED;
    case ProposalStatusDb.PENDING:
      return ProposalStatus.PENDING;
    case ProposalStatusDb.REJECTED:
      return ProposalStatus.REJECTED;
    case ProposalStatusDb.EXPIRED:
      return ProposalStatus.EXPIRED;
    case ProposalStatusDb.QUEUED:
      return ProposalStatus.QUEUED;
  }
};

export const parseProposal = (proposal: Proposal): IProposal => {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    body: proposal.body ?? undefined,
    transparencyReport: proposal.transparencyReport ?? undefined,
    resources: proposal.resources?.map((resource) => JSON.parse(resource)),
    status: parseStatus(proposal.status),
    type: proposal.type,
    isEmergency: proposal.isEmergency,
    createdAt: proposal.createdAt ?? undefined,
    currentStage: proposal.currentStage as ProposalStages,
    publisher: proposal.creators.map((creator) => JSON.parse(creator)),
    actions: proposal.actions?.map((action) => JSON.parse(action)),
    includedPips: proposal.includedPips?.map((iPips) => JSON.parse(iPips)),
    parentPip: proposal.parentPip ? JSON.parse(proposal.parentPip) : null,
    stages: [],
  };
};

export const serializeProposals = (proposal: IProposal): Proposal => {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    body: proposal.body ?? null,
    transparencyReport: proposal.transparencyReport ?? null,
    status: serializeStatus(proposal.status),
    isEmergency: proposal.isEmergency ?? false,
    currentStage: proposal.currentStage,
    createdAt: proposal.createdAt ?? null,
    creators: proposal.publisher.map((publisher) => JSON.stringify(publisher)),
    resources: proposal.resources.map((resource) => JSON.stringify(resource)),
    type: proposal.type,
    actions: proposal.actions?.map((action) => JSON.stringify(action)),
    includedPips: proposal.includedPips?.map((iPips) => JSON.stringify(iPips)),
    parentPip: proposal.parentPip ? JSON.stringify(proposal.parentPip) : null,
  };
};

export const parseProposals = (proposals: Proposal[]): IProposal[] => {
  return proposals.map(parseProposal);
};

export const parseStage = (stage: Stage): IProposalStage => {
  return {
    id: stage.id,
    type: parseType(stage.type),
    status: parseStatus(stage.status),
    createdAt: stage.createdAt ?? undefined,
    startTimestamp: stage.startTimestamp ?? undefined,
    endTimestamp: stage.endTimestamp ?? undefined,
    creator: stage.creator.map((creator) => JSON.parse(creator)),
    resources: stage.resources?.map((resource) => JSON.parse(resource)),
    voting: stage.voting ? JSON.parse(stage.voting) : null,
  };
};

export const serializeStage = (proposalId: string, stage: IProposalStage): Omit<Stage, "proposalId"> => {
  return {
    // TODO: Fix this
    id: `${proposalId}-${stage.id}`,
    type: sererializeType(stage.type),
    status: serializeStatus(stage.status),
    statusMessage: stage.statusMessage ?? null,
    createdAt: stage.createdAt ?? null,
    startTimestamp: stage.startTimestamp ?? null,
    endTimestamp: stage.endTimestamp ?? null,
    creator: stage.creator.map((creator) => JSON.stringify(creator)),
    resources: stage.resources.map((resource) => JSON.stringify(resource)),
    voting: stage.voting ? JSON.stringify(stage.voting) : null,
  };
};

export const serializeStages = (proposalId: string, stages: IProposalStage[]) => {
  return stages.map((stage) => serializeStage(proposalId, stage));
};
