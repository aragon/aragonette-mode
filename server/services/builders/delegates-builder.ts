// import {
//   GITHUB_COUNCIL_FILENAME,
//   GITHUB_REPO,
//   GITHUB_USER,
// } from "@/constants";
import { IDelegatesSortBy, IDelegatesSortDir, type IDelegateDataListItem } from "@/server/client/types/domain";
import { getGitHubCouncilMembersData } from "@/services/github";
import { logger } from "@/services/logger";

export type ICouncilMemberDataListItem = {
  name?: string;
  address: string;
  bio?: string;
};

const MOCK_MEMBERS: ICouncilMemberDataListItem[] = [
  {
    name: "Alice Johnson",
    address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    bio: "Expert in blockchain technology with over a decade of experience.",
  },
  {
    // name: "Bob Smith",
    address: "0x2a3b4c5d6e7f8a9b0c1d2e3f4b5a6c7d8e9f0a1b",
    bio: "Cybersecurity specialist focusing on securing decentralized systems.",
  },
  {
    name: "CryptoKing",
    address: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    bio: "DeFi pioneer known for innovative smart contract solutions.",
  },
  {
    name: "EtherealDream",
    address: "0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    bio: "Smart contracts expert with a focus on Ethereum development.",
  },
  {
    name: "SatoshiLite",
    address: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    bio: "Cryptocurrency legend and advocate for decentralized finance.",
  },
];

export const getCouncilMembers = async function (): Promise<ICouncilMemberDataListItem[]> {
  logger.info("Fetching council members...");
  // return getGitHubCouncilMembersData({
  //   user: GITHUB_USER,
  //   repo: GITHUB_REPO,
  //   council_filename: GITHUB_COUNCIL_FILENAME,
  // });
  return MOCK_MEMBERS;
};

const sortByFeatured = (featuredDelegatesAddresses: string[], a: IDelegateDataListItem, b: IDelegateDataListItem) => {
  const aFeatured = featuredDelegatesAddresses.includes(a.address);
  const bFeatured = featuredDelegatesAddresses.includes(b.address);

  if (aFeatured && !bFeatured) {
    return -1;
  }
  if (!aFeatured && bFeatured) {
    return 1;
  }

  return 0;
};

const sortByVotingPower = (a: IDelegateDataListItem, b: IDelegateDataListItem) => {
  const aVp = a.votingPower ?? 0;
  const bVp = b.votingPower ?? 0;

  if (aVp > bVp) {
    return -1;
  }
  if (aVp < bVp) {
    return 1;
  }

  return 0;
};

const sortByDelegationCount = (a: IDelegateDataListItem, b: IDelegateDataListItem) => {
  const aDelegationCount = a.delegationCount ?? 0;
  const bDelegationCount = b.delegationCount ?? 0;

  if (aDelegationCount > bDelegationCount) {
    return -1;
  }
  if (aDelegationCount < bDelegationCount) {
    return 1;
  }

  return 0;
};
