export interface IMemberDataListItem {
  address: string;
  name?: string; // name or ensName
  votingPower?: number;
  delegationCount?: number;
}
