import { IDelegatesSortBy, IDelegatesSortDir } from "@/features/membership/services/members/domain";

export const generateSortOptions = (sort: string) => {
  if (!sort) return {};

  const [sortBy, sortDir] = sort.split("-") as [IDelegatesSortBy, IDelegatesSortDir];
  return { sortBy: sortBy, sortDir };
};

export const sortItems = [
  {
    value: `${IDelegatesSortBy.FEATURED}-${IDelegatesSortDir.ASC}`,
    label: "Sort by featured",
    type: "ASC" as const,
  },
  {
    value: `${IDelegatesSortBy.DELEGATION_COUNT}-${IDelegatesSortDir.ASC}`,
    label: "Sort by delegations (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${IDelegatesSortBy.DELEGATION_COUNT}-${IDelegatesSortDir.DESC}`,
    label: "Sort by delegations (DESC)",
    type: "DESC" as const,
  },
  {
    value: `${IDelegatesSortBy.VOTING_POWER}-${IDelegatesSortDir.ASC}`,
    label: "Sort by voting power (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${IDelegatesSortBy.VOTING_POWER}-${IDelegatesSortDir.DESC}`,
    label: "Sort by voting power (DESC)",
    type: "DESC" as const,
  },
];
