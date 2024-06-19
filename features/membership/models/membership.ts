import { ICouncilMember } from "../services/members/domain";

export interface ICouncilMembersProvider {
  (params?: any): Promise<ICouncilMember[]>;
}
