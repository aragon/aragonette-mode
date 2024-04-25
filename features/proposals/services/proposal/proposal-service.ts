import { type IPaginatedResponse } from "@/utils/types";
import { type IProposal, type IProposalVote } from "./domain";
import type { IFetchProposalParams, IFetchProposalListParams, IFetchVotesParams, IVoteParams } from "./params";

const BASE_URL = "/api/proposals";

export async function fetchProposals(params: IFetchProposalListParams): Promise<IPaginatedResponse<IProposal>> {
  const response = await fetch(BASE_URL);
  const parsed: IPaginatedResponse<IProposal> = await response.json();
  return parsed;
}

export async function fetchProposal(params: IFetchProposalParams): Promise<IProposal> {
  const response = await fetch(`${BASE_URL}/${params.proposalId}`);
  const parsed: IProposal = await response.json();
  return parsed;
}

export async function fetchVotes(params: IFetchVotesParams): Promise<IProposalVote[]> {
  const response = await fetch(`${BASE_URL}/${params.proposalId}/${params.stageId}/votes`);
  const parsed: IProposalVote[] = await response.json();
  return parsed;
}

export async function castVote(params: IVoteParams) {
  const response = await fetch(`${BASE_URL}/${params.proposalId}/${params.stageId}/vote`, {
    method: "POST",
    body: JSON.stringify(params),
  });

  const parsed = await response.json();
  return parsed;
}
