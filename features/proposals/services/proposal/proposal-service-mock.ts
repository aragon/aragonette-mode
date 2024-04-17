import { type Address } from "viem";
import { ProposalStage, ProposalTypes, Votes, type IProposal, type IProposalStage, type IProposalVote } from "./domain";
import { type IFetchProposalListParams, type IFetchProposalParams, type IFetchVotesParams } from "./params";

export type ProposalStatus =
  | "accepted"
  | "active"
  | "challenged"
  | "draft"
  | "executed"
  | "expired"
  | "failed"
  | "partiallyExecuted"
  | "pending"
  | "queued"
  | "rejected"
  | "vetoed";

const addresses: Address[] = [
  "0x1234567890abcdef1234567890abcdef12345678",
  "0xaBCdef1234567890abcdef1234567890abcdef12",
  "0x0abcdef1234567890abcdef1234567890abcdef12",
  // Add more addresses as needed
];

// Helper function to get a random status
function getRandomStatus(): ProposalStatus {
  const statuses: ProposalStatus[] = [
    "accepted",
    "active",
    "challenged",
    "draft",
    "executed",
    "expired",
    "failed",
    "partiallyExecuted",
    "pending",
    "queued",
    "rejected",
    "vetoed",
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Generate random dates within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate mock stages for each proposal
function generateStages(): IProposalStage[] {
  return [
    {
      id: ProposalStage.DRAFT,
      name: "Draft",
      status: getRandomStatus(),
      startTimestamp: randomDate(new Date(2023, 0, 1), new Date(2023, 0, 10)).toISOString(),
      endTimestamp: randomDate(new Date(2023, 0, 11), new Date(2023, 0, 20)).toISOString(),
      creator: addresses[Math.floor(Math.random() * addresses.length)],
      link: "https://example.com/draft",
    },
    {
      id: ProposalStage.COUNCIL_APPROVAL,
      name: "Council Approval",
      status: getRandomStatus(),
      startTimestamp: randomDate(new Date(2023, 0, 21), new Date(2023, 0, 30)).toISOString(),
      endTimestamp: randomDate(new Date(2023, 0, 31), new Date(2023, 1, 10)).toISOString(),
      creator: addresses[Math.floor(Math.random() * addresses.length)],
      link: "https://example.com/council",
    },
  ];
}

// Generate random votes for a given proposal and stage
function generateVotes(proposalId: string, stageId: ProposalStage): IProposalVote[] {
  return Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () => ({
    address: addresses[Math.floor(Math.random() * addresses.length)],
    proposalId,
    stageId,
    vote: Math.random() > 0.5 ? Votes.YES : Votes.NO,
    weight: Math.floor(Math.random() * 1000 + 100),
  }));
}

// Generate mock proposals
const proposals: IProposal[] = Array.from({ length: 10 }, (_, i) => {
  return {
    id: `proposal${i + 1}`,
    title: `Proposal Title ${i + 1}`,
    description: `This is the description for proposal ${i + 1}.`,
    status: getRandomStatus(),
    actions: [],
    type: Object.values(ProposalTypes)[Math.floor(Math.random() * Object.values(ProposalTypes).length)],
    currentStage: Math.floor(Math.random() * Object.values(ProposalStage).length),
    stages: generateStages(),
  };
});

// Map to store votes for easy access
const votesMap = new Map();

proposals.forEach((proposal) => {
  proposal.stages.forEach((stage) => {
    const votesForStage = generateVotes(proposal.id, stage.id);
    const key = `${proposal.id}-${stage.id}`;
    votesMap.set(key, votesForStage);
  });
});

export async function fetchVotes(params: IFetchVotesParams): Promise<IProposalVote[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  const key = `${params.proposalId}-${params.stageId}`;
  return votesMap.get(key) || [];
}

export async function fetchProposals(params: IFetchProposalListParams): Promise<IProposal[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  return proposals;
}

export async function fetchProposal(params: IFetchProposalParams): Promise<IProposal | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  return proposals.find((p) => p.id === params.proposalId.toString()) ?? undefined;
}
