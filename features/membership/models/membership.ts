export type CouncilMember = {
  name: string;
  address: string;
};

export interface ICouncilMembersProvider {
  (params?: any): Promise<CouncilMember[]>;
}
