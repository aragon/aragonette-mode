import { PUB_CHAIN } from "@/constants";
import { formatHexString } from "@/utils/evm";
import { generateBreadcrumbs } from "@/utils/nav";
import { CardCollapsible, Heading, IconType, Link } from "@aragon/ods";
import { useRouter } from "next/router";
import { type Address } from "viem";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { DelegateAside } from "../components/delegateAside/delegateAside";
import { DelegationStatement } from "../components/delegationStatement/delegationStatement";
import { HeaderMember } from "../components/headerMember/headerMember";
import { MemberVotesDataList } from "../components/memberVotesDataList/memberVotesDataList";

export const DelegateProfile = () => {
  const { query, asPath } = useRouter();
  const address = query.address as string;
  const breadcrumbs = generateBreadcrumbs(asPath);

  const formattedAddress = formatHexString(address);

  return (
    <div className="flex flex-col items-center">
      <HeaderMember breadcrumbs={breadcrumbs} address={address} />
      <div className="flex w-full max-w-screen-xl gap-x-16 gap-y-6 px-4 py-6 md:px-16 md:pb-20 md:pt-12">
        {/* Main section */}
        <div className="flex w-[720px] flex-col gap-y-20">
          {/* Delegation Statement */}
          {/* TODO: update to proper component */}
          <div className="flex w-full flex-col gap-y-6">
            <DelegationStatement />
            {/* Delegations Received */}
            {/* TODO: update to proper component */}
            <div>Delegations received</div>
          </div>

          <div className="flex w-full flex-col gap-y-6">
            {/* Voting activity */}
            <Heading size="h2">Voting activity</Heading>
            <MemberVotesDataList address={address} />
          </div>

          <div className="flex w-full flex-col gap-y-6">
            {/* Proposal creation */}
            {/* TODO: update to proper component */}
            <Heading size="h2">Proposal creation</Heading>
          </div>
        </div>
        {/* Aside */}
        <DelegateAside address={address} />
      </div>
    </div>
  );
};
