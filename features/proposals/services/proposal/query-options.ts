import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  type IFetchProposalListParams,
  type IFetchProposalParams,
  type IFetchVotedParams,
  type IFetchVotesParams,
} from "./params";
import { proposalService } from "./proposal-service";
import { toProposalDataListItems, toProposalDetails } from "./selectors";

export const proposalKeys = {
  all: ["proposals"] as const,
  list: (params: IFetchProposalListParams) => [...proposalKeys.all, "list", params] as const,
  detail: (params: IFetchProposalParams) => [...proposalKeys.all, "details", params] as const,
  voted: (params: IFetchVotedParams) =>
    [...proposalKeys.all, ...proposalKeys.detail({ proposalId: params.proposalId }), "voted", params] as const,
  votes: (params: IFetchVotesParams) =>
    [...proposalKeys.all, ...proposalKeys.detail({ proposalId: params.proposalId }), "votes", params] as const,
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
  return queryOptions({
    queryKey: proposalKeys.detail(params),
    queryFn: async () => {
      const proposal = await proposalService.fetchProposal(params);
      return await toProposalDetails(proposal);
    },
  });
}

export function proposalVotes(params: IFetchVotesParams) {
  return queryOptions({
    queryKey: proposalKeys.votes(params),
    queryFn: () => proposalService.fetchVotes(params),
  });
}

export function voted(params: IFetchVotedParams) {
  return queryOptions({
    queryKey: proposalKeys.voted(params),
    queryFn: () => proposalService.voted(params),
  });
}
