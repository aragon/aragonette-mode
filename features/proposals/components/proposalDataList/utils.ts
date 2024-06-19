import { ProposalSortBy, ProposalSortDir } from "../../repository/proposal";

export const generateSortOptions = (sort: string) => {
  if (!sort) return {};

  const [sortBy, sortDir] = sort.split("-") as [ProposalSortBy, ProposalSortDir];
  return { sortBy: sortBy, sortDir };
};

export const sortItems = [
  {
    value: `${ProposalSortBy.CreatedAt}-${ProposalSortDir.Asc}`,
    label: "Sort by created at (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${ProposalSortBy.CreatedAt}-${ProposalSortDir.Desc}`,
    label: "Sort by created at (DESC)",
    type: "DESC" as const,
  },
  {
    value: `${ProposalSortBy.Status}-${ProposalSortDir.Asc}`,
    label: "Sort by status (ASC)",
    type: "ASC" as const,
  },
  {
    value: `${ProposalSortBy.Status}-${ProposalSortDir.Desc}`,
    label: "Sort by status (DESC)",
    type: "DESC" as const,
  },
  { value: `${ProposalSortBy.Title}-${ProposalSortDir.Asc}`, label: "Sort by title (ASC)", type: "ASC" as const },
  {
    value: `${ProposalSortBy.Title}-${ProposalSortDir.Desc}`,
    label: "Sort by title (DESC)",
    type: "DESC" as const,
  },
];
