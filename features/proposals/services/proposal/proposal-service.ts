import { PUB_API_BASE_URL } from "@/constants";
import { printStageParam } from "@/utils/api-utils";
import { type IPaginatedResponse } from "@/utils/types";
import { type ICanVote, type IProposal, type IProposalVote, type IVoted } from "./domain";
import type {
  IFetchCanVoteParams,
  IFetchProposalListParams,
  IFetchProposalParams,
  IFetchVotedParams,
  IFetchVotesParams,
} from "./params";

class ProposalService {
  async fetchProposals(params: IFetchProposalListParams): Promise<IPaginatedResponse<IProposal>> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/proposals`, params);
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

  async fetchVoted(params: IFetchVotedParams): Promise<IVoted> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/voted`, {
      ...params,
      stage: printStageParam(params.stage),
    });
    const response = await fetch(url);
    const parsed: IVoted = await response.json();
    return parsed;
  }

  async fetchCanVote(params: IFetchCanVoteParams): Promise<ICanVote> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/canVote`, { ...params, stage: printStageParam(params.stage) });
    const response = await fetch(url);
    const parsed: ICanVote = await response.json();
    return parsed;
  }

  async fetchVotes(params: IFetchVotesParams): Promise<IPaginatedResponse<IProposalVote>> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/votes`, {
      ...params,
      stage: printStageParam(params.stage),
    });

    const response = await fetch(url);
    const parsed: IPaginatedResponse<IProposalVote> = await response.json();
    return parsed;
  }
}

function encodeSearchParams(baseUrl: string, params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  // Iterate over object properties
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  // Construct the URL with encoded query parameters
  return `${baseUrl}?${searchParams.toString()}`;
}

export const proposalService = new ProposalService();
