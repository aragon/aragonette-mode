import { type IGetGitHubFeaturedDelegatesDataParams, type IGetGitHubCouncilDataParams } from "@/services/github";
import { type ICouncilMemberDataListItem, type IDelegateDataListItem } from "../../client/types/domain";

export type ICouncilMembersProvider = (params: IGetGitHubCouncilDataParams) => Promise<ICouncilMemberDataListItem[]>;

export type IFeaturedDelegateProvider = (
  params: IGetGitHubFeaturedDelegatesDataParams
) => Promise<IDelegateDataListItem[]>;
