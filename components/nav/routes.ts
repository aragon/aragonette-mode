import { IconType } from "@aragon/ods";

export const Dashboard = { path: "/", id: "dashboard", name: "Dashboard", icon: IconType.APP_DASHBOARD };

export const Proposals = {
  name: "Proposals",
  id: "proposals",
  path: "/proposals",
  icon: IconType.APP_PROPOSALS,
};

export const ProposalDetails = {
  name: "Proposal Details",
  id: "proposals-details",
  path: "/proposals/:id",
  getPath: (id: number | string) => `/proposals/${id}`,
};
