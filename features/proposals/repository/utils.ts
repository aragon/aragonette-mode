import { Proposal, Stage } from "@prisma/client";

import { IProposal } from "..";
import { ProposalStatus, ProposalStages, IProposalStage } from "../services/proposal/domain";

export const parseProposal = (proposal: Proposal): IProposal => {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    body: proposal.body ?? undefined,
    transparencyReport: proposal.transparencyReport ?? undefined,
    resources: proposal.resources?.map((resource) => JSON.parse(resource)),
    status: proposal.status as ProposalStatus,
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
    status: proposal.status,
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
    type: stage.type as ProposalStages,
    status: stage.status as ProposalStatus,
    createdAt: stage.createdAt ?? undefined,
    startTimestamp: stage.startTimestamp ?? undefined,
    endTimestamp: stage.endTimestamp ?? undefined,
    creator: stage.creator.map((creator) => JSON.parse(creator)),
    resources: stage.resources?.map((resource) => JSON.parse(resource)),
    voting: stage.voting ? JSON.parse(stage.voting) : null,
  };
};

export const serializeStage = (proposalId: string, stage: IProposalStage) => {
  return {
    // TODO: Fix this
    id: `${proposalId}-${stage.id}`,
    type: stage.type,
    status: stage.status,
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
