import { PUB_TOKEN_SYMBOL } from "@/constants";
import { formatHexString } from "@/utils/evm";
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
import React from "react";
import { type Address } from "viem";
import { sepolia } from "viem/chains";
import { useEnsName } from "wagmi";

interface IHeaderMemberProps {
  breadcrumbs: IBreadcrumbsLink[];
  address: string;
}

export const HeaderMember: React.FC<IHeaderMemberProps> = (props) => {
  const { breadcrumbs, address } = props;

  const { data: ensName } = useEnsName({ chainId: sepolia.id, address: address as Address });

  const formattedAddress = formatHexString(address);
  const bio = "Product Designer building in Web 3 — Onchain Enthusiast, Cyclist + Music Nerd";

  // stats
  const votingPower = "400000";
  const tokenBalance = "400000";
  const delegationsReceived = "5";
  const lastActivity = "3"; // last activity = proposal vote vs creation

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="w-full max-w-screen-xl gap-y-6  px-4 py-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs.map((v) => ({ ...v, label: formatHexString(v.label) }))}
          tag={{ label: "Delegate", variant: "info" }}
        />

        {/* Content Wrapper */}
        {/* TODO: fetch delegate metadata */}
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
                  <span className="text-base text-neutral-500">{PUB_TOKEN_SYMBOL}</span>
                </div>
                <span className="text-sm text-neutral-500">Voting power</span>
              </div>
              {/* Token Balance */}
              <div className="flex flex-col gap-y-1 leading-tight">
                <div className="flex items-baseline gap-x-1">
                  <span className="text-2xl text-neutral-800">
                    {formatterUtils.formatNumber(tokenBalance, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
                  </span>
                  <span className="text-base text-neutral-500">{PUB_TOKEN_SYMBOL}</span>
                </div>
                <span className="text-sm text-neutral-500">Token balance</span>
              </div>
              {/* Delegations */}
              <div className="flex flex-col gap-y-1 leading-tight">
                <span className="text-2xl text-neutral-800">{formatterUtils.formatNumber(delegationsReceived)}</span>
                <span className="text-sm text-neutral-500">Delegations</span>
              </div>
              {/* Last Activity */}
              <div className="flex flex-col gap-y-1 leading-tight">
                <div className="flex items-baseline gap-x-1">
                  <span className="text-2xl text-neutral-800">{lastActivity}</span>
                  <span className="text-base text-neutral-500">days ago</span>
                </div>
                <span className="text-sm text-neutral-500">Last activity</span>
              </div>
            </div>
            <span className="flex gap-x-4">
              <Button className="!rounded-full">Delegate to</Button>
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
                <Dropdown.Item icon={IconType.COPY} iconPosition="right" onClick={() => clipboardUtils.copy(address)}>
                  {formattedAddress}
                </Dropdown.Item>
              </Dropdown.Container>
            </span>
          </div>
          <span>
            {/* TODO: Should be size 2xl */}
            <MemberAvatar address={address} size="lg" />
          </span>
        </div>
      </div>
    </div>
  );
};
