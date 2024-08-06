import { PUB_API_BASE_URL } from "@/constants";
import { type IPaginatedResponse } from "@/utils/types";
import {
  type ICanVote,
  type IProposal,
  type IProposalVote,
  type IVoted,
  printStageParam,
  type ProposalStatus,
} from "./domain";
import type {
  IFetchCanVoteParams,
  IFetchProposalListParams,
  IFetchProposalParams,
  IFetchVotedParams,
  IFetchVotesParams,
} from "./params";
import { encodeSearchParams } from "@/utils/query";
import { serializeProposalStatus } from "@/server/models/proposals";

type IFetchSerializedProposalListParams = Omit<IFetchProposalListParams, "status"> & {
  status?: string | ProposalStatus;
};

class ProposalService {
  async fetchProposalsCount(): Promise<number> {
    const url = `${PUB_API_BASE_URL}/proposals/count`;

    const response = await fetch(url);
    const parsed: number = await response.json();
    return parsed;
  }

  async fetchProposals(params: IFetchProposalListParams): Promise<IPaginatedResponse<IProposal>> {
    const searchParams: IFetchSerializedProposalListParams = { ...params };

    if (params.status) {
      searchParams.status = serializeProposalStatus(params.status);
    }

    const url = encodeSearchParams(`${PUB_API_BASE_URL}/proposals`, searchParams);

    const response = await fetch(url);
    const parsed: IPaginatedResponse<IProposal> = await response.json();
    return parsed;
  }

  async invalidateProposals() {
    const response = await fetch(`${PUB_API_BASE_URL}/update-proposals-and-votes`);
    const parsed: boolean = await response.json();
    return parsed;
  }

  async fetchProposal(params: IFetchProposalParams): Promise<IProposal> {
    const url = `${PUB_API_BASE_URL}/proposals/${params.proposalId}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Proposal not found");
      }
      throw new Error("An error occurred while fetching the proposal");
    }

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

export const proposalService = new ProposalService();
