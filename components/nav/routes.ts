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

export const Members = { name: "Members", id: "members", path: "/members", icon: IconType.APP_MEMBERS };

export const MemberProfile = {
  name: "Profile",
  id: "member-profile",
  path: "/members/:address",
  getPath: (address: string) => `/members/${address}`,
};

export const Learn = { name: "Learn", id: "learn", path: "/learn", icon: IconType.APP_EXPLORE };
