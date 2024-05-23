import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  type IFetchProposalListParams,
  type IFetchProposalParams,
  type IFetchVotedParams,
  type IFetchVotesParams,
} from "./params";
import { proposalService } from "./proposal-service";
import { toProposalDataListItems, toProposalDetails } from "./selectors";
import { toProposalVotes } from "./selectors/toProposalVote";

export const proposalKeys = {
  all: ["proposals"] as const,
  proposal: (params: { proposalId: string }) => [...proposalKeys.all, "details", params] as const,
  list: (params: IFetchProposalListParams) => [...proposalKeys.all, "list", params] as const,
  detail: (params: IFetchProposalParams) => [...proposalKeys.all, "details", params] as const,
  voted: (params: IFetchVotedParams) =>
    [...proposalKeys.detail({ proposalId: params.proposalId }), "voted", params] as const,
  votes: (params: IFetchVotesParams) =>
    [...proposalKeys.detail({ proposalId: params.proposalId }), "votes", params] as const,
};

export function proposalList(params: IFetchProposalListParams = {}) {
  return infiniteQueryOptions({
    queryKey: proposalKeys.list(params),
    queryFn: async () => proposalService.fetchProposals(params),
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    select: (data) => ({
      proposals: data.pages.flatMap((p) => toProposalDataListItems(p.data)),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
  });
}

export function proposal(params: IFetchProposalParams) {
  const enabled = areAllPropertiesDefined(params);
  return queryOptions({
    queryKey: proposalKeys.detail(params),
    queryFn: async () => {
      const proposal = await proposalService.fetchProposal(params);
      return await toProposalDetails(proposal);
    },
    enabled,
  });
}

export function proposalVotes(params: IFetchVotesParams) {
  const enabled = areAllPropertiesDefined(params);
  return infiniteQueryOptions({
    initialPageParam: 1,
    getNextPageParam: () => undefined,
    queryKey: proposalKeys.votes(params),
    queryFn: () => proposalService.fetchVotes(params),
    select: (data) => ({
      votes: data.pages.flatMap((p) => toProposalVotes(p.data, params.stage)),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
    enabled,
  });
}

export function voted(params: IFetchVotedParams) {
  const enabled = areAllPropertiesDefined(params);
  return queryOptions({
    queryKey: proposalKeys.voted(params),
    queryFn: () => proposalService.voted(params),
    select: (data) => !!data.hasVoted,
    enabled,
  });
}

function areAllPropertiesDefined<T>(obj: T): boolean {
  for (const key in obj) {
    if (obj[key] == null) {
      return false;
    }
  }
  return true;
}
