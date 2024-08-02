import { IconType } from "@aragon/ods";

export const Dashboard = { path: "/", id: "dashboard", name: "Dashboard", icon: IconType.APP_DASHBOARD };

export const Proposals = {
  name: "Proposals",
  id: "proposals",
  path: "/proposals",
  icon: IconType.APP_PROPOSALS,
};

export const ProposalDetails = {
  name: "Proposal details",
  id: "proposals-details",
  path: "/proposals/:id",
  getPath: (id: number | string) => `/proposals/${id}`,
};

export const NewProposal = {
  name: "Create proposal",
  id: "new-proposal",
  path: "/proposals/new",
  icon: IconType.APP_PROPOSALS,
  exitPath: "/proposals",
};

export const PostDetail = {
  name: "Post",
  id: "Post",
  path: "/learn/:slug",
  getPath: (slug: string) => `/learn/${slug}`,
};

export const Council = {
  name: "Council",
  id: "council",
  path: "/council",
};

export const ProcessRoutes = [NewProposal];
