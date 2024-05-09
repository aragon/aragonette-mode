import { queryClient } from "@/utils/query-client";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { type IFetchProposalListParams, type IFetchProposalParams, type IFetchVotesParams } from "./params";
import { fetchProposals, fetchVotes } from "./proposal-service";
import { toProposalDataListItems, toProposalDetails } from "./selectors";

export const proposalKeys = {
  all: ["proposals"] as const,
  list: (params: IFetchProposalListParams) => [...proposalKeys.all, "list", params] as const,
  detail: (params: IFetchProposalParams) => [...proposalKeys.all, "details", params] as const,
  votes: (params: IFetchVotesParams) => [...proposalKeys.all, "votes", params] as const,
};

export function proposalList(params: IFetchProposalListParams = "unknown") {
  return infiniteQueryOptions({
    queryKey: proposalKeys.list(params),
    queryFn: async () => await fetchProposals(params),
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
    // TODO: use for singular proposal
    // queryFn: () => fetchProposal(params),
    queryFn: async () => {
      const proposal = queryClient.getQueryData(proposalList().queryKey)?.pages[0].data[Number(params.proposalId)];
      return await toProposalDetails(proposal);
    },
  });
}

export function proposalVotes(params: IFetchVotesParams) {
  return queryOptions({
    queryKey: proposalKeys.votes(params),
    queryFn: () => fetchVotes(params),
  });
}
