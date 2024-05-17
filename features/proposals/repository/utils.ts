import { Proposal, Stage } from "@prisma/client";

import { IProposal } from "..";
import { ProposalStatus, ProposalStages, IProposalStage } from "../services/proposal/domain";

export const parseProposal = (proposal: Proposal): IProposal => {
  return {
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    body: proposal.body ?? "",
    transparencyReport: proposal.transparencyReport ?? "",
    resources: proposal.resources?.map((resource) => JSON.parse(resource)),
    status: proposal.status as ProposalStatus,
    type: proposal.type,
    isEmergency: proposal.isEmergency,
    createdAt: proposal.createdAt,
    currentStage: proposal.currentStage as ProposalStages,
    publisher: proposal.creators.map((creator) => JSON.parse(creator)),
    actions: proposal.actions?.map((action) => JSON.parse(action)),
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
    createdAt: proposal.createdAt,
    creators: proposal.publisher.map((publisher) => JSON.stringify(publisher)),
    resources: proposal.resources.map((resource) => JSON.stringify(resource)),
    type: proposal.type,
    actions: proposal.actions?.map((action) => JSON.stringify(action)),
  };
};

export const parseProposals = (proposals: Proposal[]): IProposal[] => {
  return proposals.map(parseProposal);
};

export const parseStage = (stage: Stage): IProposalStage => {
  return {
    id: stage.id as ProposalStages,
    status: stage.status as ProposalStatus,
    createdAt: stage.createdAt?.toISOString(),
    startTimestamp: stage.startTimestamp?.toISOString(),
    endTimestamp: stage.endTimestamp?.toISOString(),
    creator: stage.creator.map((creator) => JSON.parse(creator)),
    resources: stage.resources?.map((resource) => JSON.parse(resource)),
    voting: stage.voting ? JSON.parse(stage.voting) : null,
  };
};

export const serializeStage = (proposalId: string, stage: IProposalStage) => {
  return {
    id: `${proposalId}-${stage.id}`,
    name: stage.id,
    status: stage.status,
    createdAt: new Date(),
    startTimestamp: new Date(),
    endTimestamp: new Date(),
    creator: stage.creator.map((creator) => JSON.stringify(creator)),
    resources: stage.resources.map((resource) => JSON.stringify(resource)),
    voting: stage.voting ? JSON.stringify(stage.voting) : null,
  };
};

export const serializeStages = (proposalId: string, stages: IProposalStage[]) => {
  return stages.map((stage) => serializeStage(proposalId, stage));
};
