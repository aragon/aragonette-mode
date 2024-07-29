import { useMetadata } from "@/hooks/useMetadata";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { isAddressEqual } from "@/utils/evm";
import { generateBreadcrumbs } from "@/utils/nav";
import { PUB_API_BASE_URL, PUB_APP_NAME, PUB_BASE_URL, PUB_X_HANDLE } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import { type Address } from "viem";
import { ProfileAside } from "../components/delegateAside/delegateAside";
import { DelegationStatement } from "../components/delegationStatement/delegationStatement";
import { HeaderMember } from "../components/headerMember/headerMember";
import { councilMemberList } from "../services/query-options";
import { Heading } from "@aragon/ods";
import { DelegationsDataList } from "../components/delegationsDataList/delegationsDataList";
import { ProposalStages } from "@/features/proposals";
import { MemberVotesDataList } from "../components/memberVotesDataList/memberVotesDataList";

export const MemberProfile: React.FC<{ ensData: { name: string; image: string } }> = ({ ensData }) => {
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

  const name = ensData?.name;
  const image = ensData?.image;

  return (
    <div className="flex flex-col items-center">
      <Head>
        <meta property="og:title" content={identifier ?? name ?? profileAddress ?? PUB_APP_NAME} key="og:title" />
        <meta
          property="og:description"
          content={bio ?? "I am a delegate on the Polygon Governance Hub!"}
          key="og:description"
        />
        <meta property="og:url" content={PUB_BASE_URL} key="og:url" />
        <meta property="og:site_name" content={PUB_APP_NAME} key="og:site_name" />
        <meta property="og:locale" content="en_US" key="og:locale" />
        <meta property="og:image" content={image ?? `${PUB_BASE_URL}/${PUB_API_BASE_URL}/delegate-og`} key="og:image" />
        <meta property="og:image:alt" content="Polygon Governance Hub logo" key="og:image:alt" />
        <meta property="og:type" content="website" key="og:type" />

        <meta name="twitter:card" content="summary" key="twitter:card" />
        <meta name="twitter:title" content={identifier ?? name ?? profileAddress ?? PUB_APP_NAME} key="twitter:title" />
        <meta
          name="twitter:description"
          content={bio ?? "I am a delegate on the Polygon Governance Hub!"}
          key="twitter:description"
        />
        <meta
          name="twitter:image"
          content={image ?? `${PUB_BASE_URL}/${PUB_API_BASE_URL}/delegate-og`}
          key="twitter:image"
        />
        <meta name="twitter:site" content={PUB_X_HANDLE} key="twitter:site" />
      </Head>
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

          {/* Voting activity */}
          <div className="flex w-full flex-col gap-y-6">
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
