import { PUB_TOKEN_ADDRESS, PUB_TOKEN_SYMBOL } from "@/constants";
import { ProposalStages } from "@/features/proposals";
import { useDelegate } from "@/plugins/erc20Votes/hooks/useDelegate";
import { useDelegateVotingPower } from "@/plugins/erc20Votes/hooks/useDelegateVotingPower";
import { useTokenBalance } from "@/plugins/erc20Votes/hooks/useTokenBalance";
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
  clipboardUtils,
  formatterUtils,
  type IBreadcrumbsLink,
} from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { formatUnits, zeroAddress, type Address } from "viem";
import { mainnet } from "viem/chains";
import { useAccount, useEnsName } from "wagmi";
import { delegationsList, votingPower as votingPowerQueryOptions } from "../../services/members/query-options";

interface IHeaderMemberProps {
  breadcrumbs: IBreadcrumbsLink[];
  address: string;
  bio: string | undefined;
}

export const HeaderMember: React.FC<IHeaderMemberProps> = (props) => {
  const { breadcrumbs, address: memberProfileAddress, bio } = props;

  const { data: ensName } = useEnsName({ chainId: mainnet.id, address: memberProfileAddress as Address });

  const formattedAddress = formatHexString(memberProfileAddress);

  // stats
  const delegationsReceived = "5";
  const lastActivity = ""; // last activity = proposal vote vs creation

  const { data: votingPower } = useQuery({
    ...votingPowerQueryOptions({ address: memberProfileAddress, stage: ProposalStages.COMMUNITY_VOTING }),
  });
  const { data } = useTokenBalance({ account: memberProfileAddress as Address, token: PUB_TOKEN_ADDRESS });
  const tokenSymbol = data?.[2] ?? PUB_TOKEN_SYMBOL;
  const tokenDecimals = data?.[1] ?? 18;
  const tokenBalance = formatUnits(data?.[0] ?? 0n, tokenDecimals);

  const { address: connectedAccount } = useAccount();
  const { data: connectedAccountDelegate, queryKey: delegateQueryKey } = useDelegate(connectedAccount);

  // profile is for the connected account
  const memberIsConnectedAccount = isAddressEqual(connectedAccount, memberProfileAddress);

  // profile is for the connected account; self-delegation
  const connectedMemberIsSelfDelegated =
    memberIsConnectedAccount && isAddressEqual(connectedAccount, connectedAccountDelegate);

  // profile is the connected account, but delegation is inactive
  const connectedMemberDelegationInactive =
    memberIsConnectedAccount && isAddressEqual(connectedAccountDelegate, zeroAddress);

  // profile is the delegate of the connected account but not the connected account
  const memberIsconnectedAccountDelegate =
    !memberIsConnectedAccount && isAddressEqual(memberProfileAddress, connectedAccountDelegate);

  const mode = memberIsconnectedAccountDelegate || connectedMemberDelegationInactive ? "claim" : "delegate";
  const { delegateVotingPower, isConfirming } = useDelegateVotingPower(mode, invalidateQueries);

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
      queryKey: votingPowerQueryOptions({ address: memberProfileAddress, stage: ProposalStages.COMMUNITY_VOTING })
        .queryKey,
      type: "all",
      refetchType: "all",
    });

    // delegations received
    queryClient.invalidateQueries({
      queryKey: delegationsList({ address: memberProfileAddress }).queryKey,
      type: "all",
      refetchType: "all",
    });
  }

  const getTagLabel = () => {
    if (memberIsConnectedAccount) {
      return "You";
    } else if (memberIsconnectedAccountDelegate) {
      return "Your delegate";
    } else {
      return "Delegate";
    }
  };

  const getCtaLabel = () => {
    if (connectedMemberIsSelfDelegated || connectedMemberDelegationInactive) {
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
      delegateVotingPower(memberProfileAddress as Address);
    }
  };

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="w-full max-w-screen-xl gap-y-6  px-4 py-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs.map((v) => ({ ...v, label: formatHexString(v.label) }))}
          tag={{ label: getTagLabel(), variant: "info" }}
        />

        {/* Content Wrapper */}
        <div className="flex w-full gap-x-20">
          <div className="flex w-full max-w-[720px] flex-col gap-y-4">
            <Heading size="h1">{formattedAddress}</Heading>
            {/* Bio */}
            <p className="text-lg text-neutral-500">{bio}</p>
            {/* Stats */}
            <div className="flex gap-x-16  py-4">
              {/* Voting power */}
              <div className="flex flex-col gap-y-1 leading-tight">
                <div className="flex items-baseline gap-x-1">
                  <span className="text-2xl text-neutral-800">
                    {formatterUtils.formatNumber(votingPower, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
                  </span>
                  <span className="text-base text-neutral-500">{tokenSymbol}</span>
                </div>
                <span className="text-sm text-neutral-500">Voting power</span>
              </div>
              {/* Token Balance */}
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
              {/* Delegations */}
              <div className="flex flex-col gap-y-1 leading-tight">
                <span className="text-2xl text-neutral-800">{formatterUtils.formatNumber(delegationsReceived)}</span>
                <span className="text-sm text-neutral-500">Delegations</span>
              </div>
              {/* Last Activity */}
              {lastActivity && (
                <div className="flex flex-col gap-y-1 leading-tight">
                  <div className="flex items-baseline gap-x-1">
                    <span className="text-2xl text-neutral-800">{lastActivity}</span>
                    <span className="text-base text-neutral-500">days ago</span>
                  </div>
                  <span className="text-sm text-neutral-500">Last activity</span>
                </div>
              )}
            </div>
            <span className="flex gap-x-4">
              <Button
                className="!rounded-full"
                isLoading={isConfirming}
                onClick={handleCtaClick}
                disabled={connectedMemberIsSelfDelegated}
              >
                {getCtaLabel()}
              </Button>
              <Dropdown.Container
                customTrigger={
                  <Button className="!rounded-full" variant="tertiary" iconRight={IconType.CHEVRON_DOWN}>
                    {ensName ?? formattedAddress}
                  </Button>
                }
              >
                {ensName && (
                  <Dropdown.Item icon={IconType.COPY} iconPosition="right" onClick={() => clipboardUtils.copy(ensName)}>
                    {ensName}
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  icon={IconType.COPY}
                  iconPosition="right"
                  onClick={() => clipboardUtils.copy(memberProfileAddress)}
                >
                  {formattedAddress}
                </Dropdown.Item>
              </Dropdown.Container>
            </span>
          </div>
          <span>
            {/* TODO: Should be size 2xl */}
            <MemberAvatar address={memberProfileAddress} size="lg" />
          </span>
        </div>
      </div>
    </div>
  );
};
