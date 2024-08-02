import { CouncilDataList } from "@/components/councilDataList/councilDataList";
import { MainSection } from "@/components/layout/mainSection";
import { PUB_TOKEN_SYMBOL } from "@/constants";
import { useMetadata } from "@/hooks/useMetadata";
import { Button, Heading, StateSkeletonBar, Toggle, ToggleGroup } from "@aragon/ods";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount } from "wagmi";
import { councilMemberList, delegatesList } from "@/features/services/query-options";

const DEFAULT_PAGE_SIZE = 12;

type GovernanceBody = "council" | "delegates";

export default function MembersList() {
  const [governanceBody, setGovernanceBody] = useState<GovernanceBody>("council");

  const { data: councilMemberListData, isLoading: councilMembersLoading } = useQuery({
    ...councilMemberList(),
  });

  const handleGovernanceBodyChange = (value: string | undefined) => {
    if (value) {
      setGovernanceBody(value as GovernanceBody);
    }
  };

  return (
    <MainSection className="md:!px-6 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280px] flex-col gap-x-20 gap-y-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex flex-col items-start gap-y-6 sm:flex-row sm:items-center sm:justify-between">
            <Heading size="h1">Council Members</Heading>
          </div>
          {governanceBody === "council" && <CouncilDataList />}
        </div>
        <aside className="flex w-full flex-col gap-y-4 md:max-w-[320px] md:gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Heading size="h3">Details</Heading>
            <p className="text-neutral-500">
              {`The Mode Governance Council consists of a set of members who can do stuff.`}
            </p>
          </div>
          <dl className="divide-y divide-neutral-100">
            {councilMembersLoading && (
              <div className="flex flex-col gap-y-2 py-3 md:gap-x-6 md:py-4">
                <StateSkeletonBar width={"40%"} className="h-6 !bg-neutral-100" />
                <StateSkeletonBar width={"50%"} className="h-5 !bg-neutral-100" />{" "}
              </div>
            )}

            {councilMemberListData && (
              <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
                <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                  Protocol council
                </dt>
                <dd className="size-full text-base leading-tight text-neutral-500">{`${councilMemberListData.length} council members`}</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </MainSection>
  );
}
