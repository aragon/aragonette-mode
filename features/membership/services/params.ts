import { type ProposalStages } from "@/features/proposals";
import { type IDelegatesSortBy, type IDelegatesSortDir } from "@/server/client/types/domain";
import { type IFetchPaginatedParams } from "@/utils/types";

export interface IFetchCouncilMembersParams extends IFetchPaginatedParams {}

export interface IFetchDelegatesParams extends IFetchPaginatedParams {
  sortBy?: IDelegatesSortBy;
  sortDir?: IDelegatesSortDir;
}

export interface IFetchVotingActivityParams extends IFetchPaginatedParams {
  address: string;
  stage: ProposalStages;
}

export interface IFetchDelegationsParams extends IFetchPaginatedParams {
  address: string;
}

export interface IFetchVotingPowerParams {
  address: string;
  stage: ProposalStages;
}
