export type ICouncilMember = {
  name: string;
  address: string;
};

export interface ICouncilMembersProvider {
  (params?: any): Promise<ICouncilMember[]>;
}
