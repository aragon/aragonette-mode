export interface IMemberDataListItem {
  address: string;
  name?: string; // name or ensName
  votingPower?: number;
  delegationCount?: number;
}

export type ICouncilMember = {
  name?: string;
  address: string;
};
