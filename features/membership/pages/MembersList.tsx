import { MainSection } from "@/components/layout/mainSection";
import { PUB_TOKEN_SYMBOL } from "@/constants";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { Button, Heading, StateSkeletonBar, Toggle, ToggleGroup } from "@aragon/ods";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { DelegateAnnouncementDialog } from "../components/delegateAnnouncementDialog/delegateAnnouncementDialog";
import { CouncilDataList } from "../components/councilDataList/councilDataList";
import { DelegateDataList } from "../components/delegateDataList/delegateDataList";
import { councilMemberList, delegatesList } from "../services/query-options";
import { useMetadata } from "@/hooks/useMetadata";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";

const DEFAULT_PAGE_SIZE = 12;

type GovernanceBody = "council" | "delegates";

export default function MembersList() {
  const [governanceBody, setGovernanceBody] = useState<GovernanceBody>("council");
  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const { address, isConnected } = useAccount();

  const { data: announcementData } = useAnnouncement(address);
  const { data: announcement } = useMetadata<IDelegationWallMetadata>(announcementData?.[0]);

  const { data: councilMemberListData, isLoading: councilMembersLoading } = useQuery({
    ...councilMemberList(),
  });

  const { data: delegatesListData, isLoading: delegatesLoading } = useInfiniteQuery({
    ...delegatesList({
      limit: DEFAULT_PAGE_SIZE,
    }),
  });

  const handleGovernanceBodyChange = (value: string | undefined) => {
    if (value) {
      setGovernanceBody(value as GovernanceBody);
    }
  };

  const getButtonLabel = () => {
    if (!isConnected) {
      return "Connect to create delegation profile";
    } else if (announcement) {
      return "Update delegation profile";
    } else {
      return "Create delegation profile";
    }
  };

  return (
    <MainSection className="md:px-16 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280] flex-col gap-x-20 gap-y-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <Heading size="h1">Members</Heading>

            <ToggleGroup isMultiSelect={false} onChange={handleGovernanceBodyChange} value={governanceBody}>
              <Toggle value="council" label="Protocol council" />
              <Toggle value="delegates" label="Delegates" />
            </ToggleGroup>
          </div>
          {governanceBody === "council" && <CouncilDataList />}
          {governanceBody === "delegates" && (
            <DelegateDataList onAnnounceDelegation={() => setShowProfileCreationDialog(true)} />
          )}
        </div>
        <aside className="flex w-full flex-col gap-y-4 md:max-w-[320px] md:gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h3">Details</Heading>
            <p className="text-neutral-500">
              {`The Polygon Governance Hub is an organisation consisting of two different governance bodies. This consists
              of an Protocol Council, which is a Multisig, and the ${PUB_TOKEN_SYMBOL} token holders, who can also delegate their
              voting power.`}
            </p>
          </div>
          <dl className="divide-y divide-neutral-100">
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Protocol council
              </dt>
              {councilMemberListData && (
                <dd className="size-full text-base leading-tight text-neutral-500">{`${councilMemberListData.length} Multisig members`}</dd>
              )}
              {councilMembersLoading && <StateSkeletonBar width={"50%"} className="h-5 !bg-neutral-100" />}
            </div>
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Delegates
              </dt>
              {delegatesListData && (
                <dd className="size-full text-base leading-tight text-neutral-500">
                  {`${delegatesListData.pagination.total} delegates`}
                </dd>
              )}
              {delegatesLoading && <StateSkeletonBar width={"50%"} className="h-5 !bg-neutral-100" />}
            </div>
          </dl>
          <Button className="!rounded-full" onClick={() => setShowProfileCreationDialog(true)} disabled={!isConnected}>
            {getButtonLabel()}
          </Button>
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
        </aside>
      </div>
    </MainSection>
  );
}
