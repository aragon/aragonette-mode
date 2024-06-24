export interface IMemberDataListItem {
  address: string;
  name?: string; // name or ensName
  votingPower?: number;
  delegationCount?: number;
  delegators?: IDelegator[];
}

export type IDelegator = {
  address: string;
  votingPower: string;
};

export type ICouncilMember = {
  name?: string;
  address: string;
};

export enum IDelegatesSortBy {
  FEATURED = "featured",
  VOTING_POWER = "votingPower",
  DELEGATION_COUNT = "delegationCount",
}

export const parseDelegatesSortBy = (value?: string): IDelegatesSortBy => {
  if (!value) {
    return IDelegatesSortBy.FEATURED;
  }

  if (value === "featured") {
    return IDelegatesSortBy.FEATURED;
  } else if (value === "votingPower") {
    return IDelegatesSortBy.VOTING_POWER;
  } else if (value === "delegationCount") {
    return IDelegatesSortBy.DELEGATION_COUNT;
  } else {
    throw new Error(`Invalid sort by value: ${value}`);
  }
};

export enum IDelegatesSortDir {
  ASC = "asc",
  DESC = "desc",
}

export const parseDelegatesSortDir = (value?: string): IDelegatesSortDir => {
  if (!value) {
    return IDelegatesSortDir.DESC;
  }

  if (value === "asc") {
    return IDelegatesSortDir.ASC;
  } else if (value === "desc") {
    return IDelegatesSortDir.DESC;
  } else {
    throw new Error(`Invalid sort direction value: ${value}`);
  }
};
