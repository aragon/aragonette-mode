import { ICouncilMember, IMemberDataListItem } from "../services/members/domain";

export interface ICouncilMembersProvider {
  (params?: any): Promise<ICouncilMember[]>;
}

export interface IFeatureDelegateProvider {
  (params?: any): Promise<IMemberDataListItem[]>;
}
