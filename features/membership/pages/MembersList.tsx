import { MainSection } from "@/components/layout/mainSection";
import { PUB_TOKEN_SYMBOL } from "@/constants";
import { useAnnouncement } from "@/plugins/delegateAnnouncer/hooks/useAnnouncement";
import { Button, Heading, Toggle, ToggleGroup } from "@aragon/ods";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { DelegateAnnouncementDialog } from "../components/delegateAnnouncementDialog/delegateAnnouncementDialog";
import { CouncilMemberList } from "../components/memberDataList/councilMemberList/councilMemberList";
import { DelegateMemberList } from "../components/memberDataList/delegateMemberList/delegateMemberList";
import { councilMemberList, delegatesList } from "../services/members/query-options";

const DEFAULT_PAGE_SIZE = 12;

export default function MembersList() {
  const [toggleValue, setToggleValue] = useState<string>("council");
  const [showProfileCreationDialog, setShowProfileCreationDialog] = useState(false);

  const { address, isConnected } = useAccount();

  const { data: announcement } = useAnnouncement(address);

  const { data: councilMemberListData } = useQuery({
    ...councilMemberList(),
  });

  const { data: delegatesListData } = useInfiniteQuery({
    ...delegatesList({
      limit: DEFAULT_PAGE_SIZE,
    }),
  });

  const onToggleChange = (value: string | undefined) => {
    if (value) {
      setToggleValue(value);
    }
  };

  return (
    <MainSection className="md:px-16 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280] flex-col gap-x-20 gap-y-8 md:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <Heading size="h1">Members</Heading>

            <ToggleGroup isMultiSelect={false} onChange={onToggleChange} value={toggleValue}>
              <Toggle value="council" label="Protocol council" />
              <Toggle value="delegates" label="Delegates" />
            </ToggleGroup>
          </div>
          {toggleValue === "council" && <CouncilMemberList />}
          {toggleValue === "delegates" && (
            <DelegateMemberList onAnnounceDelegation={() => setShowProfileCreationDialog(true)} />
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
              <dd className="size-full text-base leading-tight text-neutral-500">{`${councilMemberListData?.length} Multisig members`}</dd>
            </div>
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Delegates
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">{`${delegatesListData?.pagination.total} delegates`}</dd>
            </div>
            {/* {token && (
              <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
                <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                  Token holders
                </dt>
                <dd className="size-full text-base leading-tight text-neutral-500">
                  <Link
                    description="View contract"
                    iconRight={IconType.LINK_EXTERNAL}
                    target="_blank"
                    rel="noopener"
                    href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${PUB_TOKEN_ADDRESS}`}
                  >
                    {`${formatterUtils.formatNumber(totalSupply, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL} holders`}
                  </Link>
                </dd>
              </div>
            )} */}
          </dl>
          <Button className="!rounded-full" onClick={() => setShowProfileCreationDialog(true)} disabled={!isConnected}>
            {!isConnected
              ? "Connect to create delegation profile"
              : announcement
                ? "Update delegation profile"
                : "Create delegation profile"}
          </Button>
          <DelegateAnnouncementDialog
            onClose={() => setShowProfileCreationDialog(false)}
            open={showProfileCreationDialog}
          />
        </aside>
      </div>
    </MainSection>
  );
}
