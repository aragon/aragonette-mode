import { type IFetchPaginatedParams } from "@/utils/types";

export interface IFetchCouncilMembersParams extends IFetchPaginatedParams {}

export interface IFetchDelegatesParams extends IFetchPaginatedParams {}

export interface IFetchVotingActivityParams extends IFetchPaginatedParams {
  address: string;
}

export interface IFetchDelegationsParams extends IFetchPaginatedParams {
  address: string;
}
