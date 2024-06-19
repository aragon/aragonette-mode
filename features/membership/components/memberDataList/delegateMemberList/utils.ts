export enum DelegateSortBy {
  Name = "name",
  Delegations = "delegations",
  VotingPower = "votingPower",
}

export enum DelegateSortDir {
  Asc = "asc",
  Desc = "desc",
}

export const generateSortOptions = (sort: string) => {
  if (!sort) return {};

  const [sortBy, sortDir] = sort.split("-") as [DelegateSortBy, DelegateSortDir];
  return { sortBy: sortBy, sortDir };
};

export const sortItems = [
  {
    value: `${DelegateSortBy.Name}-${DelegateSortDir.Asc}`,
    label: "Sort by name (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${DelegateSortBy.Name}-${DelegateSortDir.Desc}`,
    label: "Sort by name (DESC)",
    type: "DESC" as const,
  },
  {
    value: `${DelegateSortBy.Delegations}-${DelegateSortDir.Asc}`,
    label: "Sort by delegations (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${DelegateSortBy.Delegations}-${DelegateSortDir.Desc}`,
    label: "Sort by delegations (DESC)",
    type: "DESC" as const,
  },
  {
    value: `${DelegateSortBy.VotingPower}-${DelegateSortDir.Asc}`,
    label: "Sort by voting power (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${DelegateSortBy.VotingPower}-${DelegateSortDir.Desc}`,
    label: "Sort by voting power (DESC)",
    type: "DESC" as const,
  },
];
