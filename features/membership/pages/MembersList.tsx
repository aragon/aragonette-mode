import { MainSection } from "@/components/layout/mainSection";
import { useMetadata } from "@/hooks/useMetadata";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { Button, Heading, StateSkeletonBar } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { DelegateAnnouncementDialog } from "../components/delegateAnnouncementDialog/delegateAnnouncementDialog";
import { DelegateDataList } from "../components/delegateDataList/delegateDataList";
import { delegatesList } from "../services/query-options";

const DEFAULT_PAGE_SIZE = 12;

export default function MembersList() {
  const { address, isConnected } = useAccount();

  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const { data: announcementData } = useAnnouncement(address);
  const { data: announcement } = useMetadata<IDelegationWallMetadata>(announcementData?.[0]);

  const { data: delegatesListData, isLoading: delegatesLoading } = useInfiniteQuery(
    delegatesList({
      limit: DEFAULT_PAGE_SIZE,
    })
  );

  const getCtaLabel = () => {
    if (!isConnected) {
      return "Connect to create a delegate profile";
    } else if (announcement) {
      return "Edit your delegate profile";
    } else {
      return "Create a delegate profile";
    }
  };

  return (
    <MainSection className="md:!px-6 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280px] flex-col gap-x-20 gap-y-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex flex-col items-start gap-y-6 sm:flex-row sm:items-center sm:justify-between">
            <Heading size="h1">Delegate profiles</Heading>
          </div>
          <DelegateDataList onAnnounceDelegation={() => setShowProfileCreationDialog(true)} />
        </div>
        <aside className="flex w-full flex-col gap-y-4 md:max-w-[320px] md:gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h3">Details</Heading>
            <p className="text-neutral-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin at hendrerit libero. Aliquam tempus
              hendrerit urna, nec fermentum nulla consequat vel. Vestibulum vel imperdiet nisi. Interdum et malesuada
              fames ac ante ipsum primis in faucibus. Aliquam viverra laoreet sapien varius ultrices.
            </p>
          </div>
          <dl className="divide-y divide-neutral-100">
            {delegatesLoading && (
              <div className="flex flex-col gap-y-2 py-3 md:gap-x-6 md:py-4">
                <StateSkeletonBar width={"40%"} className="h-6 !bg-neutral-100" />
                <StateSkeletonBar width={"50%"} className="h-5 !bg-neutral-100" />
              </div>
            )}

            {delegatesListData && (
              <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
                <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                  Delegates
                </dt>
                <dd className="size-full text-base leading-tight text-neutral-500">
                  {`${delegatesListData.pagination.total} delegate profiles`}
                </dd>
              </div>
            )}
          </dl>
          <Button className="!rounded-full" onClick={() => setShowProfileCreationDialog(true)} disabled={!isConnected}>
            {getCtaLabel()}
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
