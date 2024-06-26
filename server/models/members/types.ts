import { ICouncilMember, IMemberDataListItem } from "../../../features/membership/services/members/domain";

export interface ICouncilMembersProvider {
  (params?: any): Promise<ICouncilMember[]>;
}

export interface IFeatureDelegateProvider {
  (params?: any): Promise<IMemberDataListItem[]>;
}
