import { ProposalStages } from "@/features/proposals";
import { useMetadata } from "@/hooks/useMetadata";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { isAddressEqual } from "@/utils/evm";
import { generateBreadcrumbs } from "@/utils/nav";
import { Heading } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { type Address } from "viem";
import { ProfileAside } from "../components/delegateAside/delegateAside";
import { DelegationsDataList } from "../components/delegationsDataList/delegationsDataList";
import { DelegationStatement } from "../components/delegationStatement/delegationStatement";
import { HeaderMember } from "../components/headerMember/headerMember";
import { MemberVotesDataList } from "../components/memberVotesDataList/memberVotesDataList";
import { councilMemberList } from "../services/query-options";

export const MemberProfile = () => {
  const { query, asPath } = useRouter();
  const profileAddress = query.address as Address;
  const breadcrumbs = generateBreadcrumbs(asPath);

  const {
    data: councilMember,
    isLoading: councilMemberLoading,
    isFetched: councilMemberFetched,
  } = useQuery({
    ...councilMemberList(),
    select: (data) => data.find((member) => isAddressEqual(member.address, profileAddress)),
  });

  const { data: announcementData, isLoading: announcementCidLoading } = useAnnouncement(profileAddress);
  const { data: announcement, isLoading: announcementLoading } = useMetadata<IDelegationWallMetadata>(
    announcementData?.[0]
  );

  const isLoading = councilMemberLoading || announcementCidLoading || announcementLoading;

  const isCouncilMember = councilMemberFetched && !!councilMember;
  const bio = isCouncilMember ? councilMember.bio : announcement?.bio;
  const identifier = isCouncilMember ? councilMember?.name : announcement?.identifier;

  return (
    <div className="flex flex-col items-center">
      <HeaderMember
        isLoading={isLoading}
        address={profileAddress}
        bio={bio}
        breadcrumbs={breadcrumbs}
        identifier={identifier}
        type={isCouncilMember ? "approvalThreshold" : "majorityVoting"}
      />
      <div className="flex w-full max-w-screen-xl flex-col gap-x-16 gap-y-12 px-4 py-6 md:flex-row md:px-16 md:pb-20 md:pt-12">
        {/* Main section */}
        <div className="flex flex-col gap-y-12 md:w-[720px] md:gap-y-20">
          {/* Delegation Statement */}
          {!isCouncilMember && (
            <div className="flex w-full flex-col gap-y-6 overflow-auto">
              <DelegationStatement message={announcement?.message} />
              {/* Delegations Received */}
              <div className="flex flex-col gap-y-3">
                <Heading size="h3">Delegations received</Heading>
                <DelegationsDataList delegate={profileAddress} />
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-y-6">
            {/* Voting activity */}
            <Heading size="h2">Voting activity</Heading>
            <MemberVotesDataList
              address={profileAddress}
              stage={isCouncilMember ? ProposalStages.COUNCIL_APPROVAL : ProposalStages.COMMUNITY_VOTING}
            />
          </div>
        </div>
        {/* Aside */}
        <aside className="flex w-full flex-1 flex-col gap-y-12 md:max-w-[320px] md:gap-y-20">
          <ProfileAside address={profileAddress} resources={announcement?.resources} />
        </aside>
      </div>
    </div>
  );
};
