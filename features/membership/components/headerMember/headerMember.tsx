import { PUB_ENS_CHAIN, PUB_TOKEN_ADDRESS, PUB_TOKEN_SYMBOL } from "@/constants";
import { ProposalStages } from "@/features/proposals";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { useDelegate } from "@/plugins/erc20Votes/hooks/useDelegate";
import { useDelegateVotingPower } from "@/plugins/erc20Votes/hooks/useDelegateVotingPower";
import { useTokenInfo } from "@/plugins/erc20Votes/hooks/useTokenBalance";
import { formatHexString, isAddressEqual } from "@/utils/evm";
import { queryClient } from "@/utils/query-client";
import {
  Breadcrumbs,
  Button,
  Dropdown,
  Heading,
  IconType,
  MemberAvatar,
  NumberFormat,
  StateSkeletonBar,
  clipboardUtils,
  formatterUtils,
  type IBreadcrumbsLink,
} from "@aragon/ods";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import React from "react";
import { formatUnits, zeroAddress, type Address } from "viem";
import { useAccount, useEnsName } from "wagmi";
import { delegatesList, delegationsList, votingPower as votingPowerQueryOptions } from "../../services/query-options";

export type MemberType = "majorityVoting" | "approvalThreshold";

interface IHeaderMemberProps {
  isLoading: boolean;
  breadcrumbs: IBreadcrumbsLink[];
  address: Address;
  bio: string | undefined;
  identifier: string | undefined;
  type?: MemberType;
}

export const HeaderMember: React.FC<IHeaderMemberProps> = (props) => {
  const { breadcrumbs, address: profileAddress, bio, identifier, type = "approvalThreshold", isLoading } = props;

  const { address: connectedAccount, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ chainId: PUB_ENS_CHAIN.id, address: profileAddress });

  // delegate hooks
  const isTokenVoting = type === "majorityVoting";
  const { data: announcementData } = useAnnouncement(profileAddress, { enabled: isTokenVoting && !!profileAddress });
  const hasDelegationProfile = !!announcementData?.[0];

  const { data: delegationCount, isLoading: delegationCountLoading } = useInfiniteQuery({
    ...delegationsList({ address: profileAddress }),
    select: (data) => data.pages[0]?.pagination?.total ?? 0,
    enabled: hasDelegationProfile,
  });

  const { data: connectedAccountDelegate, queryKey: delegateQueryKey } = useDelegate(connectedAccount, {
    enabled: !!connectedAccount && isTokenVoting,
  });

  const { data: tokenData, isLoading: tokenBalanceLoading } = useTokenInfo(
    { account: profileAddress, token: PUB_TOKEN_ADDRESS },
    { enabled: !!profileAddress && !!PUB_TOKEN_ADDRESS && !!isTokenVoting }
  );

  const { data: votingPower, isLoading: vpLoading } = useQuery({
    ...votingPowerQueryOptions({ address: profileAddress, stage: ProposalStages.COMMUNITY_VOTING }),
    enabled: !!profileAddress && isTokenVoting,
  });

  // profile is for the connected account
  const memberIsConnectedAccount = isAddressEqual(connectedAccount, profileAddress);

  // profile is for the connected account; self-delegation
  const connectedMemberIsSelfDelegated =
    memberIsConnectedAccount && isAddressEqual(connectedAccount, connectedAccountDelegate);

  // profile is the connected account, but delegation is inactive
  const connectedMemberDelegationInactive =
    memberIsConnectedAccount && isAddressEqual(connectedAccountDelegate, zeroAddress);

  // profile is the delegate of the connected account but not the connected account
  const memberIsconnectedAccountDelegate =
    !memberIsConnectedAccount && isAddressEqual(profileAddress, connectedAccountDelegate);

  const mode = memberIsconnectedAccountDelegate || connectedMemberDelegationInactive ? "claim" : "delegate";
  const { delegateVotingPower, isConfirming } = useDelegateVotingPower(mode, invalidateQueries);

  // stats
  const formattedAddress = formatHexString(profileAddress);
  const tokenSymbol = tokenData?.[2] ?? PUB_TOKEN_SYMBOL;
  const tokenDecimals = tokenData?.[1] ?? 18;
  const tokenBalance = tokenData ? formatUnits(tokenData?.[0] ?? 0n, tokenDecimals) : undefined;

  function invalidateQueries() {
    // voting power of the previous delegate
    queryClient.invalidateQueries({
      queryKey: votingPowerQueryOptions({
        address: connectedAccountDelegate as Address,
        stage: ProposalStages.COMMUNITY_VOTING,
      }).queryKey,
      type: "all",
      refetchType: "all",
    });

    // invalidate who connected account is delegating to
    queryClient.invalidateQueries({ queryKey: delegateQueryKey, type: "all", refetchType: "all" });

    // voting power of the member profile address
    queryClient.invalidateQueries({
      queryKey: votingPowerQueryOptions({ address: profileAddress, stage: ProposalStages.COMMUNITY_VOTING }).queryKey,
      type: "all",
      refetchType: "all",
    });

    // delegations received
    queryClient.invalidateQueries({
      queryKey: delegationsList({ address: profileAddress }).queryKey,
      type: "all",
      refetchType: "all",
    });

    // list of delegates
    queryClient.invalidateQueries({
      queryKey: delegatesList({ limit: 12 }).queryKey,
      type: "all",
      refetchType: "all",
    });
  }

  const getTagLabel = () => {
    if (!isTokenVoting) {
      return "Council member";
    } else if (memberIsConnectedAccount) {
      return "You";
    } else if (memberIsconnectedAccountDelegate) {
      return "Your delegate";
    } else {
      return "Delegate";
    }
  };

  const getCtaLabel = () => {
    if (!isConnected) {
      return "Connect to delegate";
    } else if (connectedMemberIsSelfDelegated || connectedMemberDelegationInactive) {
      return isConfirming ? "Claiming voting power" : "Claim voting power";
    } else if (memberIsconnectedAccountDelegate || memberIsConnectedAccount) {
      return isConfirming ? "Reclaiming voting power" : "Reclaim voting power";
    } else {
      return isConfirming ? "Delegating" : "Delegate to";
    }
  };

  const handleCtaClick = () => {
    if (memberIsconnectedAccountDelegate || connectedMemberDelegationInactive) {
      delegateVotingPower(connectedAccount);
    } else {
      delegateVotingPower(profileAddress);
    }
  };

  const isNeitherCouncilNorDelegate = isTokenVoting && !hasDelegationProfile;
  const showTag = !isNeitherCouncilNorDelegate;

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="flex w-full max-w-screen-xl flex-col gap-y-6 px-4 py-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs.map((v) => ({ ...v, label: formatHexString(v.label) }))}
          {...(showTag ? { tag: { label: getTagLabel(), variant: "info" } } : {})}
        />

        {/* Content Wrapper */}
        <div className="flex flex-col gap-y-4">
          <div className="flex w-full md:gap-x-20">
            <div
              className={classNames("flex w-full max-w-[720px] flex-col gap-y-4", {
                "justify-center": !isTokenVoting || isNeitherCouncilNorDelegate,
              })}
            >
              {isLoading && <StateSkeletonBar className="h-[36px] !bg-neutral-100" width={"35%"} />}
              {!isLoading && <Heading size="h1">{identifier ?? formattedAddress}</Heading>}

              {/* Bio */}
              {bio && <p className="text-lg text-neutral-500">{bio}</p>}
              {isLoading && (
                <div className="flex w-full flex-col gap-y-2 py-2">
                  <StateSkeletonBar className="h-[24px] !bg-neutral-100" width={"80%"} />
                  <StateSkeletonBar className="h-[24px] !bg-neutral-100" width={"95%"} />
                  <StateSkeletonBar className="h-[24px] !bg-neutral-100" width={"93%"} />
                </div>
              )}

              {/* Stats */}
              {isTokenVoting && (
                <div className="flex flex-row justify-between gap-y-3 py-4 md:justify-normal md:gap-x-16">
                  {/* Voting power */}
                  {votingPower != null && (
                    <div className="flex flex-col gap-y-1 leading-tight">
                      <div className="flex items-baseline gap-x-1">
                        <span className="text-2xl text-neutral-800">
                          {formatterUtils.formatNumber(votingPower, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
                        </span>
                        <span className="text-base text-neutral-500">{tokenSymbol}</span>
                      </div>
                      <span className="text-sm text-neutral-500">Voting power</span>
                    </div>
                  )}
                  {vpLoading && (
                    <div className="flex flex-col gap-y-2 py-1">
                      <StateSkeletonBar className="h-[20px] !bg-neutral-100" width={"60px"} />
                      <StateSkeletonBar className="h-[16px] !bg-neutral-100" width={"80px"} />
                    </div>
                  )}

                  {/* Token Balance */}
                  {tokenBalance != null && (
                    <div className="flex flex-col gap-y-1 leading-tight">
                      <div className="flex items-baseline gap-x-1">
                        <span className="text-2xl text-neutral-800">
                          {formatterUtils.formatNumber(tokenBalance, {
                            format: NumberFormat.TOKEN_AMOUNT_SHORT,
                          })}
                        </span>
                        <span className="text-base text-neutral-500">{tokenSymbol}</span>
                      </div>
                      <span className="text-sm text-neutral-500">Token balance</span>
                    </div>
                  )}
                  {tokenBalanceLoading && (
                    <div className="flex flex-col gap-y-2 py-1">
                      <StateSkeletonBar className="h-[20px] !bg-neutral-100" width={"60px"} />
                      <StateSkeletonBar className="h-[16px] !bg-neutral-100" width={"80px"} />
                    </div>
                  )}

                  {/* Delegations */}
                  {delegationCount != null && (
                    <div className="flex flex-col gap-y-1 leading-tight">
                      <span className="text-2xl text-neutral-800">
                        {formatterUtils.formatNumber(delegationCount, { format: NumberFormat.GENERIC_SHORT })}
                      </span>
                      <span className="text-sm text-neutral-500">Delegations</span>
                    </div>
                  )}
                  {delegationCountLoading && (
                    <div className="flex flex-col gap-y-2 py-1">
                      <StateSkeletonBar className="h-[20px] !bg-neutral-100" width={"50px"} />
                      <StateSkeletonBar className="h-[16px] !bg-neutral-100" width={"80px"} />
                    </div>
                  )}
                </div>
              )}
            </div>
            <span>
              {/* TODO: Should be size 2xl */}
              <MemberAvatar address={profileAddress} size="lg" responsiveSize={{}} />
            </span>
          </div>
          <div>
            <span className="flex w-full flex-col gap-x-4 gap-y-3 md:flex-row">
              {hasDelegationProfile && isTokenVoting && (
                <Button
                  className="!rounded-full"
                  isLoading={isConfirming}
                  onClick={handleCtaClick}
                  disabled={connectedMemberIsSelfDelegated || !isConnected}
                >
                  {getCtaLabel()}
                </Button>
              )}
              {(ensName ?? formattedAddress) && (
                <Dropdown.Container
                  customTrigger={
                    <Button className="!rounded-full" variant="tertiary" iconRight={IconType.CHEVRON_DOWN}>
                      {ensName ?? formattedAddress}
                    </Button>
                  }
                >
                  {ensName && (
                    <Dropdown.Item
                      icon={IconType.COPY}
                      iconPosition="right"
                      onClick={() => clipboardUtils.copy(ensName)}
                    >
                      {ensName}
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item
                    icon={IconType.COPY}
                    iconPosition="right"
                    onClick={() => clipboardUtils.copy(profileAddress)}
                  >
                    {formattedAddress}
                  </Dropdown.Item>
                </Dropdown.Container>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
