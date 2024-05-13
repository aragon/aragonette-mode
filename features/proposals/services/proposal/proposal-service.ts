import { type IPaginatedResponse } from "@/utils/types";
import { type IVoted, type IProposal, type IProposalVote } from "./domain";
import type {
  IFetchProposalParams,
  IFetchProposalListParams,
  IFetchVotesParams,
  IVoteParams,
  IFetchVotedParams,
} from "./params";
import { PUB_API_BASE_URL } from "@/constants";
import { printStageParam } from "@/utils/api-utils";

class ProposalService {
  async fetchProposals(params: IFetchProposalListParams): Promise<IPaginatedResponse<IProposal>> {
    const url = `${PUB_API_BASE_URL}/proposals`;
    const response = await fetch(url);
    const parsed: IPaginatedResponse<IProposal> = await response.json();
    return parsed;
  }

  async fetchProposal(params: IFetchProposalParams): Promise<IProposal> {
    const url = `${PUB_API_BASE_URL}/proposals/${params.proposalId}`;
    const response = await fetch(url);
    const parsed: IProposal = await response.json();
    return parsed;
  }

  async voted(params: IFetchVotedParams): Promise<IVoted> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/voted`, {
      ...params,
      stageId: printStageParam(params.stageId),
    });
    const response = await fetch(url);
    const parsed: IVoted = await response.json();
    return parsed;
  }

  async fetchVotes(params: IFetchVotesParams): Promise<IProposalVote[]> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/votes`, params);
    const response = await fetch(url);
    const parsed: IProposalVote[] = await response.json();
    return parsed;
  }

  async castVote(params: IVoteParams) {
    const url = `${PUB_API_BASE_URL}/vote`;

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(params),
    });

    const parsed = await response.json();
    return parsed;
  }
}

function encodeSearchParams(baseUrl: string, params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  // Iterate over object properties
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value)); // Ensure the value is a string
  });

  // Construct the URL with encoded query parameters
  return `${baseUrl}?${searchParams.toString()}`;
}

export const proposalService = new ProposalService();
