export const Dashboard = { path: "/", id: "dashboard", name: "Dashboard" };

export const Proposals = {
  name: "Proposals",
  id: "proposals",
  path: "/proposals",
};

export const ProposalDetails = {
  name: "Proposal Details",
  id: "proposals-details",
  path: "/proposals/:id",
  getPath: (id: number | string) => `/proposals/${id}`,
};

export const Members = { name: "Members", id: "members", path: "/members" };

export const MemberProfile = {
  name: "Profile",
  id: "member-profile",
  path: "/members/:address",
  getPath: (address: string) => `/members/${address}`,
};

export const Learn = { name: "Learn", id: "learn", path: "/learn" };
