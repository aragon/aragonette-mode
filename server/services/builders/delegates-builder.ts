import {
  GITHUB_COUNCIL_FILENAME,
  GITHUB_FEATURED_DELEGATES_FILENAME,
  GITHUB_REPO,
  GITHUB_USER,
  PUB_CHAIN,
  PUB_DELEGATION_CONTRACT_ADDRESS,
  PUB_MULTISIG_ADDRESS,
  PUB_TOKEN_ADDRESS,
  SNAPSHOT_SPACE,
} from "@/constants";
import { ProposalStages } from "@/features/proposals";
import {
  IDelegatesSortBy,
  IDelegatesSortDir,
  type IDelegateDataListItem,
  type IDelegator,
  type IProviderVotingActivity,
} from "@/server/client/types/domain";
import { getGitHubCouncilMembersData, getGitHubFeaturedDelegatesData } from "@/services/github";
import { logger } from "@/services/logger";
import {
  getDelegateMessage,
  getDelegatesList,
  getDelegations,
  getMultisigVotingActivity,
} from "@/services/rpc/delegationWall";
import { getSnapshotDelegators } from "@/services/rpc/snapshotDelegation";
import { getSnapshotVotingPower } from "@/services/snapshot";
import { getSnapshotVotingActivity } from "@/services/snapshot/votingActivity";
import { paginateArray } from "@/utils/pagination";
import { type Address } from "viem";

export const getDelegators = async function (address: string, page: number, limit: number) {
  logger.info(`Fetching delegators for address: ${address} (page: ${page}, limit: ${limit})...`);
  const delegations = await getSnapshotDelegators(address as Address);

  return paginateArray<IDelegator>(delegations, page, limit);
};

export const getCouncilMembers = async function () {
  logger.info("Fetching council members...");
  return getGitHubCouncilMembersData({
    user: GITHUB_USER,
    repo: GITHUB_REPO,
    council_filename: GITHUB_COUNCIL_FILENAME,
  });
};

export const getVotingActivity = async function (
  address: Address,
  stage: ProposalStages
): Promise<IProviderVotingActivity[]> {
  switch (stage) {
    case ProposalStages.COMMUNITY_VOTING:
      return getSnapshotVotingActivity({
        space: SNAPSHOT_SPACE,
        voter: address,
      });
    case ProposalStages.COUNCIL_APPROVAL:
    case ProposalStages.COUNCIL_CONFIRMATION:
      return getMultisigVotingActivity(address, PUB_MULTISIG_ADDRESS);
    default:
      return [];
  }
};

// TODO: Store in the DB or replace with delegates from App
export const getDelegates = async function (
  page: number,
  limit: number,
  search: string | undefined,
  sortBy: IDelegatesSortBy = IDelegatesSortBy.FEATURED,
  sortDir: IDelegatesSortDir = IDelegatesSortDir.DESC
) {
  logger.info(`Fetching delegates (page: ${page}, limit: ${limit}, sortBy: ${sortBy}, sortDir: ${sortDir})...`);

  logger.info(`Fetching contract delegates data...`);
  const contractDelegatesRes = await getDelegatesList(PUB_CHAIN.id, PUB_DELEGATION_CONTRACT_ADDRESS);
  logger.info(`Contract delegates: ${contractDelegatesRes.length}`);

  const contractDelegates = contractDelegatesRes.map((delegate) => {
    return {
      address: delegate,
    } as IDelegateDataListItem;
  });

  logger.info(`Fetching voting power for contract delegates...`);
  const delegatesWithVp = await Promise.all(
    contractDelegates.map(async (delegate) => {
      delegate.votingPower = await getSnapshotVotingPower({
        space: SNAPSHOT_SPACE,
        voter: delegate.address,
      });
      delegate.delegators = await getSnapshotDelegators(delegate.address as Address);
      delegate.delegationCount = delegate.delegators.length;
      return delegate;
    })
  );

  logger.info(`Fetching featured delegates data...`);
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

  const delegatesWithIdentifiers = delegates.map((d, index) => ({
    ...d,
    name: d.name ?? identifiers[index].identifier,
  }));

  const filteredDelegates = search
    ? delegatesWithIdentifiers.filter(
        (d) => d.name?.toLowerCase()?.includes(search) || d.address?.toLowerCase()?.includes(search)
      )
    : delegatesWithIdentifiers;

  return paginateArray(filteredDelegates, page, limit);
};

// Order delegates by sortBy following this order: featuredDelegates, then votingPower and delegationCount
const sortDelegates = (
  delegates: IDelegateDataListItem[],
  featured: string[],
  sortBy: IDelegatesSortBy,
  sortDir: IDelegatesSortDir
) => {
  delegates.sort((a, b) => {
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
    delegates.reverse();
  }

  return delegates;
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
