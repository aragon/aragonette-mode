import {
  GITHUB_FEATURED_DELEGATES_FILENAME,
  GITHUB_REPO,
  GITHUB_USER,
  PUB_CHAIN,
  PUB_DELEGATION_CONTRACT_ADDRESS,
  PUB_TOKEN_ADDRESS,
  SNAPSHOT_SPACE,
} from "@/constants";
import { getGitHubFeaturedDelegatesData } from "../../providers/github";
import { getDelegatesList, getDelegationCount } from "../../providers/onchain";
import { getSnapshotVotingPower } from "../../../proposals/providers/snapshot";
import { Address } from "viem";
import { IMemberDataListItem } from "./domain";

export const getFeaturedDelegates = async function (page: number, limit: number) {
  const featuredDelegates = await getGitHubFeaturedDelegatesData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    featured_delegates_filename: GITHUB_FEATURED_DELEGATES_FILENAME,
  });

  const contractDelegates = await getDelegatesList(PUB_CHAIN.id, PUB_DELEGATION_CONTRACT_ADDRESS);

  // Filter out the featured delegates that are in the contract
  const filteredFeaturedDelegates = featuredDelegates.filter((delegate) => {
    return contractDelegates
      .map((contractDelegate) => contractDelegate.toLowerCase())
      .includes(delegate.address.toLowerCase());
  });

  // Filter out the contract delegates that are not in the featured delegates
  const filteredContractDelegates = contractDelegates
    .filter((contractDelegate) => {
      return !filteredFeaturedDelegates
        .map((delegate) => delegate.address.toLowerCase())
        .includes(contractDelegate.toLowerCase());
    })
    .map((contractDelegate) => {
      return {
        address: contractDelegate,
      } as IMemberDataListItem;
    });

  // Combine the featured and contract delegates
  const delegates = [...filteredFeaturedDelegates, ...filteredContractDelegates];

  const total = delegates.length;
  if (total === 0) {
    return {
      pagination: {
        total,
        page: 1,
        pages: 1,
        limit,
      },
      data: [],
    };
  }

  if (total / limit < page) {
    page = Math.ceil(total / limit);
  }
  const paginatedDelegates = delegates.slice((page - 1) * limit, page * limit);

  const delegatesWithVp = paginatedDelegates.map(async (delegate) => {
    delegate.votingPower = await getSnapshotVotingPower({
      space: SNAPSHOT_SPACE,
      voter: delegate.address,
    });
    delegate.delegationCount = await getDelegationCount(delegate.address as Address, PUB_TOKEN_ADDRESS);
    return delegate;
  });

  const data = await Promise.all(delegatesWithVp);

  return {
    pagination: {
      total,
      page: page,
      pages: Math.ceil(data.length / limit),
      limit: limit,
    },
    data,
  };
};
