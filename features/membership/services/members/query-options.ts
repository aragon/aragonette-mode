import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { membersService } from "./member-service";
import {
  type IFetchDelegatesParams,
  type IFetchCouncilMembersParams,
  type IFetchVotingActivityParams,
  type IFetchDelegationsParams,
} from "./params";

export const memberKeys = {
  all: ["members"] as const,
  council: (params: IFetchCouncilMembersParams) => [...memberKeys.all, "council", params] as const,
  delegate: () => [...memberKeys.all, "delegate"] as const,
  delegates: (params: IFetchDelegatesParams) => [...memberKeys.all, "delegates", params] as const,
  delegations: (params: IFetchDelegationsParams) => [...memberKeys.delegate(), "delegations", params] as const,
  votingActivity: (params: IFetchVotingActivityParams) => [...memberKeys.delegate(), "votingActivity", params] as const,
};

export function councilMemberList(params: IFetchCouncilMembersParams = {}) {
  return queryOptions({
    queryKey: memberKeys.council(params),
    queryFn: async () => membersService.fetchCouncilMembers({}),
  });
}

export function delegatesList(params: IFetchDelegatesParams = {}) {
  return infiniteQueryOptions({
    queryKey: memberKeys.delegates(params),
    queryFn: async (ctx) => membersService.fetchDelegates({ ...params, page: ctx.pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      (lastPage?.pagination?.pages ?? 1) > lastPageParam ? lastPageParam + 1 : undefined,
    select: (data) => ({
      delegates: data.pages.flatMap((p) => p.data),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
  });
}

export function delegationsList(params: IFetchDelegationsParams) {
  return infiniteQueryOptions({
    queryKey: memberKeys.delegations(params),
    queryFn: async (ctx) => membersService.fetchDelegationsReceived({ ...params, page: ctx.pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      (lastPage?.pagination?.pages ?? 1) > lastPageParam ? lastPageParam + 1 : undefined,
    select: (data) => ({
      members: data.pages.flatMap((p) => p.data),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
  });
}

export function votingActivity(params: IFetchVotingActivityParams) {
  return infiniteQueryOptions({
    queryKey: memberKeys.votingActivity(params),
    queryFn: async (ctx) => membersService.fetchVotingActivity({ ...params, page: ctx.pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      (lastPage?.pagination?.pages ?? 1) > lastPageParam ? lastPageParam + 1 : undefined,
    select: (data) => ({
      votes: data.pages.flatMap((p) => p.data.filter((data) => !!data.proposal)),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
  });
}
