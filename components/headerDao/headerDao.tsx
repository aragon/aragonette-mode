import { DelegateAnnouncementDialog } from "@/features/membership/components/delegateAnnouncementDialog/delegateAnnouncementDialog";
import { councilMemberList, delegatesList } from "@/features/membership/services/query-options";
import { proposalList } from "@/features/proposals";
import { useMetadata } from "@/hooks/useMetadata";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { IDelegatesSortBy } from "@/server/client/types/domain";
import { ProposalSortBy, ProposalSortDir } from "@/server/models/proposals";
import { isAddressEqual } from "@/utils/evm";
import { Button, formatterUtils, IconType, NumberFormat, StateSkeletonBar } from "@aragon/ods";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Learn, NewProposal } from "../nav/routes";

export const HeaderDao = () => {
  const router = useRouter();
  const { address } = useAccount();

  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const {
    data: totalProposals,
    isLoading: totalProposalsLoading,
    isFetched: totalProposalsFetched,
    error: totalProposalsError,
  } = useInfiniteQuery({
    ...proposalList({ limit: 6, sortBy: ProposalSortBy.CreatedAt, sortDir: ProposalSortDir.Asc }),
    select: (data) => data.pages[0].pagination.total,
  });

  const { data: isCouncilMember, isFetched: isCouncilMemberFetched } = useQuery({
    ...councilMemberList(),
    select: (data) => !!data.find((member) => isAddressEqual(member.address, address)),
    enabled: !!address,
  });

  const {
    data: totalCouncilMembers,
    isLoading: totalCouncilMembersLoading,
    isFetched: totalCouncilMembersFetched,
    error: totalCouncilMembersError,
  } = useQuery({ ...councilMemberList(), select: (data) => data.length });

  const { data: announcementCid, isFetched: isDelegateFetched } = useAnnouncement(address, { enabled: !!address });
  const { data: announcement } = useMetadata<IDelegationWallMetadata>(announcementCid?.[0]);
  const isDelegate = !!announcementCid;

  const {
    data: totalDelegates,
    isLoading: totalDelegatesLoading,
    isFetched: totalDelegatesFetched,
    error: totalDelegatesError,
  } = useInfiniteQuery({
    ...delegatesList({ limit: 9, sortBy: IDelegatesSortBy.FEATURED }),
    select: (data) => data.pages[0].pagination.total,
  });

  const membersLoading = totalCouncilMembersLoading || totalDelegatesLoading;
  const membersFetched = totalCouncilMembersFetched && totalDelegatesFetched && !membersLoading;
  const totalMembers = (totalCouncilMembers ?? 0) + (totalDelegates ?? 0);
  const totalMembersError = !!totalCouncilMembersError || !!totalDelegatesError;

  const totalProposalCountFetched = totalProposalsFetched && !totalProposalsLoading;

  const getCtaLabel = () => {
    if (isCouncilMember) {
      return "Create onchain PIP";
    } else if (isDelegate) {
      return "Edit your delegate profile";
    } else {
      return "Create your delegate profile";
    }
  };

  const handleCtaClick = () => {
    if (isCouncilMember) {
      router.push(NewProposal.path);
    } else if (isDelegate) {
      setShowProfileCreationDialog(true);
    }
  };

  const showPrimaryCta = isDelegate || isCouncilMember;
  const secondaryCtaVariant = !showPrimaryCta && isCouncilMemberFetched && isDelegateFetched ? "primary" : "secondary";

  return (
    <>
      <header className="relative z-[5] flex w-full justify-center">
        <div className="flex w-full max-w-screen-xl flex-col gap-y-8 px-4 pb-8 pt-8 md:gap-y-12 md:px-6 md:pt-16">
          <div className="flex flex-col gap-y-8">
            <div className="flex flex-col gap-y-6 md:w-4/5">
              <h1 className="text-4xl leading-tight text-neutral-800 md:text-5xl">Polygon Governance Hub</h1>
              <p className="text-2xl leading-normal text-neutral-600">
                Welcome to the Polygon Governance Hub, responsible for facilitating changes to Polygon Protocols.
                Participate in governance by becoming a delegate and voting on PIPs.
              </p>
            </div>
          </div>
          <div className="flex gap-x-20 md:w-4/5">
            {/* Proposal count */}
            {totalProposalCountFetched && !totalProposalsError && (
              <div className="flex flex-col gap-y-1.5">
                <span className="text-4xl text-neutral-800">
                  {formatterUtils.formatNumber(totalProposals, { format: NumberFormat.GENERIC_SHORT })}
                </span>
                <span className="text-xl text-neutral-500">Proposals</span>
              </div>
            )}
            {totalProposalsLoading && (
              <div className="flex w-24 flex-col justify-between gap-y-3 pb-1 pt-3">
                <StateSkeletonBar size="2xl" className="h-[30px] !bg-neutral-100 py-4" width={"65%"} />
                <StateSkeletonBar size="xl" className="!bg-neutral-100" width={"100%"} />
              </div>
            )}

            {/* Member count */}
            {membersFetched && !totalMembersError && (
              <div className="flex flex-col gap-y-1.5">
                <span className="text-4xl text-neutral-800">
                  {formatterUtils.formatNumber(totalMembers, { format: NumberFormat.GENERIC_SHORT })}
                </span>
                <span className="text-xl text-neutral-500">Members</span>
              </div>
            )}
            {membersLoading && (
              <div className="flex w-24 flex-col justify-between gap-y-3 pb-1 pt-3">
                <StateSkeletonBar size="2xl" className="h-[30px] !bg-neutral-100 py-4" width={"65%"} />
                <StateSkeletonBar size="xl" className="!bg-neutral-100" width={"100%"} />
              </div>
            )}
          </div>
          <span className="flex flex-col gap-x-4 gap-y-3 md:flex-row">
            {showPrimaryCta && (
              <Button
                className="!rounded-full"
                variant="primary"
                size="lg"
                {...(isCouncilMember ? { iconLeft: IconType.PLUS } : {})}
                onClick={handleCtaClick}
              >
                {getCtaLabel()}
              </Button>
            )}
            <Button
              className="!rounded-full"
              variant={secondaryCtaVariant}
              size="lg"
              onClick={() => {
                router.push(Learn.path);
              }}
            >
              Learn more
            </Button>
          </span>
        </div>
      </header>
      {showProfileCreationDialog && (
        <DelegateAnnouncementDialog
          onClose={() => setShowProfileCreationDialog(false)}
          open={showProfileCreationDialog}
          {...(announcement
            ? {
                defaultValues: {
                  identifier: announcement?.identifier,
                  bio: announcement?.bio,
                  message: announcement?.message,
                  resources: announcement?.resources,
                },
              }
            : {})}
        />
      )}
    </>
  );
};
