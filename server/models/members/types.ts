import { type ICouncilMember, type IMemberDataListItem } from "../../client/types/domain";

export interface ICouncilMembersProvider {
  (params?: any): Promise<ICouncilMember[]>;
}

export interface IFeatureDelegateProvider {
  (params?: any): Promise<IMemberDataListItem[]>;
}
