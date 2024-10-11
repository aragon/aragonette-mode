import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";
import { SectionHeader } from "./components/section-header";
import { StakePositions } from "./components/gauges-list";
import React from "react";
import { DateFormat, formatterUtils, NumberFormat } from "@aragon/ods";
import { useGetVotingStartsIn } from "./hooks/useGetVotingStartsIn";
import { useGetVotingEndsIn } from "./hooks/useGetVotingEndsIn";
import { Token } from "./types/tokens";

export default function PluginPage() {
  const { votingStartsIn } = useGetVotingStartsIn(Token.MODE, BigInt(Math.floor(new Date().getTime() / 1000)));
  const { votingEndsIn } = useGetVotingEndsIn(Token.MODE, BigInt(Math.floor(new Date().getTime() / 1000)));

  const active = votingEndsIn && votingEndsIn !== 0n;
  const nextVotingDateD = Number(active ? votingEndsIn : votingStartsIn) * 1000 + new Date().getTime();
  const nextVotingDate = formatterUtils.formatDate(nextVotingDateD, {
    format: DateFormat.RELATIVE,
  });

  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />
      <MainSection>
        <SectionHeader title="Vote to direct incentives" learnMoreUrl={PUB_STAKING_LEARN_MORE_URL}>
          Use your voting power to support different projects and receive incentives in return. Your voting power resets
          each epoch, allowing you to vote on new projects.
        </SectionHeader>
        <br />
        <div className="flex flex-col gap-x-20 gap-y-6 sm:flex-row md:w-4/5">
          <div className="flex flex-col">
            <div className=" flex items-baseline gap-x-1">
              <span className="title text-3xl text-primary-400 md:text-3xl">{nextVotingDate}</span>
              <span className="md:text-md text-md">in days</span>
            </div>
            <span className="text-md text-neutral-500">{active ? "Current" : "Next"} voting window</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-x-1">
              <span className="title text-3xl text-primary-400 md:text-3xl">
                {formatterUtils.formatNumber(101120, {
                  format: NumberFormat.GENERIC_SHORT,
                })}
              </span>
            </div>
            <span className="text-md text-neutral-500">Total voting power</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-x-1">
              <span className="title text-3xl text-primary-400 md:text-3xl">
                ~
                {formatterUtils.formatNumber(457732, {
                  format: NumberFormat.GENERIC_SHORT,
                })}
              </span>
            </div>
            <span className="text-md text-neutral-500">Total available incentives</span>
          </div>
        </div>
        <br />
        <StakePositions />
      </MainSection>
    </div>
  );
}
