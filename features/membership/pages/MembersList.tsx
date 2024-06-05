import { MainSection } from "@/components/layout/mainSection";
import { Button, Heading, IconType, Link, Toggle, ToggleGroup } from "@aragon/ods";
import { useState } from "react";
import { CouncilMemberList } from "../components/MemberDataList/councilMemberList";
import { PUB_CHAIN, PUB_TOKEN_ADDRESS, PUB_TOKEN_SYMBOL } from "@/constants";
import { DelegateMemberList } from "../components/MemberDataList/delegateMemberList";

export default function MembersList() {
  const [toggleValue, setToggleValue] = useState<string>("council");

  const onToggleChange = (value: string | undefined) => {
    if (value) {
      setToggleValue(value);
    }
  };

  return (
    <MainSection className="md:px-16 md:pb-20 xl:pt-12">
      <div className="flex w-full max-w-[1280] gap-x-20">
        <div className="flex flex-1 flex-col gap-y-6">
          <div className="flex items-center justify-between">
            <Heading size="h1">Members</Heading>

            <ToggleGroup isMultiSelect={false} onChange={onToggleChange} value={toggleValue}>
              <Toggle value="council" label="Protocol council" />
              <Toggle value="delegates" label="Delegates" />
            </ToggleGroup>
          </div>
          {toggleValue === "council" && <CouncilMemberList />}
          {toggleValue === "delegates" && <DelegateMemberList />}
        </div>
        <aside className="flex max-w-[320px] flex-col gap-y-6">
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
              <dd className="size-full text-base leading-tight text-neutral-500">12 Multisig members</dd>
            </div>
            <div className="flex flex-col items-baseline gap-y-2 py-3 md:gap-x-6 md:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 md:line-clamp-6 md:w-40">
                Delegates
              </dt>
              <dd className="size-full text-base leading-tight text-neutral-500">42 delegates</dd>
            </div>
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
                >{`TOTAL SUPPLY ${PUB_TOKEN_SYMBOL} holders`}</Link>
              </dd>
            </div>
          </dl>
          <Button className="!rounded-full">Create your delegate profile</Button>
        </aside>
      </div>
    </MainSection>
  );
}
