import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { type IFetchProposalListParams, type IFetchProposalParams, type IFetchVotesParams } from "./params";
import { fetchProposal, fetchProposals, fetchVotes } from "./proposal-service";
import { toProposalDataListItems } from "../../components/proposalDataList/transformer";

export const proposalKeys = {
  all: ["proposals"] as const,
  list: (params: IFetchProposalListParams) => [...proposalKeys.all, "list", params] as const,
  detail: (params: IFetchProposalParams) => [...proposalKeys.all, "details", params] as const,
  votes: (params: IFetchVotesParams) => [...proposalKeys.all, "votes", params] as const,
};

export function proposalList(params: IFetchProposalListParams) {
  return infiniteQueryOptions({
    queryKey: proposalKeys.list(params),
    queryFn: async () => {
      const fetched = await fetchProposals(params);
      return toProposalDataListItems(fetched);
    },
    initialPageParam: 1,
    getNextPageParam: () => undefined,
  });
}

export function proposal(params: IFetchProposalParams) {
  return queryOptions({
    queryKey: proposalKeys.detail(params),
    queryFn: () => fetchProposal(params),
  });
}

export function proposalVotes(params: IFetchVotesParams) {
  return queryOptions({
    queryKey: proposalKeys.votes(params),
    queryFn: () => fetchVotes(params),
  });
}
