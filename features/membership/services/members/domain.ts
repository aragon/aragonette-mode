export interface ICouncilMemberListItem {
  address: string;
  name?: string;
}

export interface IDelegateListItem {
  address: string;
  name?: string; // name or ensName
  votingPower: number;
  delegationCount: number;
}
