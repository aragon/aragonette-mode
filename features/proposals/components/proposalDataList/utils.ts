import { ProposalSortBy, ProposalSortDir } from "../../../../server/models/proposals";

export const generateSortOptions = (sort: string) => {
  if (!sort) return {};

  const [sortBy, sortDir] = sort.split("-") as [ProposalSortBy, ProposalSortDir];
  return { sortBy: sortBy, sortDir };
};

export const sortItems = [
  {
    value: `${ProposalSortBy.CreatedAt}-${ProposalSortDir.Desc}`,
    label: "Most recent",
    type: "DESC" as const,
  },
  { value: `${ProposalSortBy.Title}-${ProposalSortDir.Asc}`, label: "Title", type: "ASC" as const },
  {
    value: `${ProposalSortBy.Status}-${ProposalSortDir.Asc}`,
    label: "Proposal status",
    type: "ASC" as const,
  },
];
