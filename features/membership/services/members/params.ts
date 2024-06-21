import { type ProposalStages } from "@/features/proposals";
import { type IFetchPaginatedParams } from "@/utils/types";
import { type IDelegatesSortBy, type IDelegatesSortDir } from "./domain";

export interface IFetchCouncilMembersParams extends IFetchPaginatedParams {}

export interface IFetchDelegatesParams extends IFetchPaginatedParams {
  sortBy?: IDelegatesSortBy;
  sortDir?: IDelegatesSortDir;
}

export interface IFetchVotingActivityParams extends IFetchPaginatedParams {
  address: string;
}

export interface IFetchDelegationsParams extends IFetchPaginatedParams {
  address: string;
}

export interface IFetchVotingPowerParams {
  address: string;
  stage: ProposalStages;
}
