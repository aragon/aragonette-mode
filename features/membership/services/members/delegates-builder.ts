import {
  GITHUB_FEATURED_DELEGATES_FILENAME,
  GITHUB_REPO,
  GITHUB_USER,
  PUB_CHAIN,
  PUB_DELEGATION_CONTRACT_ADDRESS,
  PUB_TOKEN_ADDRESS,
  SNAPSHOT_SPACE,
} from "@/constants";
import { type Address } from "viem";
import { getSnapshotVotingPower } from "../../../proposals/providers/snapshot";
import { getGitHubFeaturedDelegatesData } from "../../providers/github";
import { getDelegateMessage, getDelegatesList, getDelegations } from "../../providers/onchain";
import { type IDelegator, IDelegatesSortBy, IDelegatesSortDir, type IMemberDataListItem } from "./domain";

export const getDelegators = async function (address: string, page: number, limit: number) {
  const delegations = await getDelegations(PUB_CHAIN.id, address as Address, PUB_TOKEN_ADDRESS);

  return paginateDelegates<IDelegator>(delegations, page, limit);
};

// TODO: Store in the DB or replace with delegates from App
export const getFeaturedDelegates = async function (
  page: number,
  limit: number,
  sortBy: IDelegatesSortBy = IDelegatesSortBy.FEATURED,
  sortDir: IDelegatesSortDir = IDelegatesSortDir.DESC
) {
  const contractDelegatesRes = await getDelegatesList(PUB_CHAIN.id, PUB_DELEGATION_CONTRACT_ADDRESS);

  const contractDelegates = contractDelegatesRes.map((delegate) => {
    return {
      address: delegate,
    } as IMemberDataListItem;
  });

  const delegatesWithVp = await Promise.all(
    contractDelegates.map(async (delegate) => {
      delegate.votingPower = await getSnapshotVotingPower({
        space: SNAPSHOT_SPACE,
        voter: delegate.address,
      });
      delegate.delegators = await getDelegations(PUB_CHAIN.id, delegate.address as Address, PUB_TOKEN_ADDRESS);
      delegate.delegationCount = delegate.delegators.length;
      return delegate;
    })
  );

  const featuredDelegates = await getGitHubFeaturedDelegatesData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    featured_delegates_filename: GITHUB_FEATURED_DELEGATES_FILENAME,
  });

  const featuredDelegatesAddresses = featuredDelegates.map((delegate) => delegate.address);

  const sortedDelegates = sortDelegates(delegatesWithVp, featuredDelegatesAddresses, sortBy, sortDir);

  const delegates = sortedDelegates.map((delegate) => {
    const featuredData = featuredDelegates.find((d) => d.address === delegate.address);

    return {
      ...delegate,
      name: featuredData?.name,
    };
  });

  const identifiers = await Promise.all(
    delegates.map((delegate) => getDelegateMessage(PUB_CHAIN.id, delegate.address as Address))
  );

  return paginateDelegates(
    delegates.map((d, index) => ({ ...d, name: d.name ?? identifiers[index].identifier })),
    page,
    limit
  );
};

const paginateDelegates = <T>(delegates: T[], page: number, limit: number) => {
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
  const data = delegates.slice((page - 1) * limit, page * limit);

  return {
    pagination: {
      total,
      page: page,
      pages: Math.ceil(total / limit),
      limit: limit,
    },
    data,
  };
};

// Order delegates by sortBy following this order: featuredDelegates, then votingPower and delegationCount
const sortDelegates = (
  delegates: IMemberDataListItem[],
  featured: string[],
  sortBy: IDelegatesSortBy,
  sortDir: IDelegatesSortDir
) => {
  const sortedDelegates = delegates.sort((a, b) => {
    if (sortBy === IDelegatesSortBy.FEATURED) {
      const res = sortByFeatured(featured, a, b);
      if (res !== 0) {
        return res;
      } else {
        return sortByVotingPower(a, b) || sortByDelegationCount(a, b);
      }
    }

    if (sortBy === IDelegatesSortBy.VOTING_POWER) {
      const res = sortByVotingPower(a, b);
      if (res !== 0) {
        return res;
      } else {
        return sortByDelegationCount(a, b);
      }
    }

    if (sortBy === IDelegatesSortBy.DELEGATION_COUNT) {
      const res = sortByDelegationCount(a, b);
      if (res !== 0) {
        return res;
      } else {
        return sortByVotingPower(a, b);
      }
    }

    return 0;
  });

  if (sortDir === IDelegatesSortDir.ASC) {
    sortedDelegates.reverse();
  }

  return sortedDelegates;
};

const sortByFeatured = (featuredDelegatesAddresses: string[], a: IMemberDataListItem, b: IMemberDataListItem) => {
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

const sortByVotingPower = (a: IMemberDataListItem, b: IMemberDataListItem) => {
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

const sortByDelegationCount = (a: IMemberDataListItem, b: IMemberDataListItem) => {
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
