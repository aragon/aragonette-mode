import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { generateBreadcrumbs } from "@/utils/nav";
import { Heading } from "@aragon/ods";
import { useRouter } from "next/router";
import { type Address } from "viem";
import { DelegateAside } from "../components/delegateAside/delegateAside";
import { DelegationStatement } from "../components/delegationStatement/delegationStatement";
import { HeaderMember } from "../components/headerMember/headerMember";
import { DelegationsReceivedDataList } from "../components/memberDataList/delegationsReceivedDataList/delegationsReceivedDataList";
import { MemberVotesDataList } from "../components/memberVotesDataList/memberVotesDataList";

export const DelegateProfile = () => {
  const { query, asPath } = useRouter();
  const address = query.address as string;
  const breadcrumbs = generateBreadcrumbs(asPath);

  const { data: announcement } = useAnnouncement(address as Address);

  return (
    <div className="flex flex-col items-center">
      <HeaderMember breadcrumbs={breadcrumbs} address={address} bio={announcement?.bio} />
      <div className="flex w-full max-w-screen-xl gap-x-16 gap-y-6 px-4 py-6 md:px-16 md:pb-20 md:pt-12">
        {/* Main section */}
        <div className="flex w-[720px] flex-col gap-y-20">
          {/* Delegation Statement */}
          <div className="flex w-full flex-col gap-y-6">
            <DelegationStatement message={announcement?.message} />
            {/* Delegations Received */}
            <div className="flex flex-col gap-y-3">
              <Heading size="h3">Delegations received</Heading>
              <DelegationsReceivedDataList address={address} />
            </div>
          </div>

          <div className="flex w-full flex-col gap-y-6">
            {/* Voting activity */}
            <Heading size="h2">Voting activity</Heading>
            <MemberVotesDataList address={address} />
          </div>
        </div>
        {/* Aside */}
        <DelegateAside address={address} resources={announcement?.resources} />
      </div>
    </div>
  );
};
