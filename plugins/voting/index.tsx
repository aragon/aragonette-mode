import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";
import { SectionHeader } from "./components/section-header";
import { StakePositions } from "./components/gauges-list";
import React from "react";
import { DateFormat, formatterUtils, NumberFormat, Spinner, StateSkeletonBar } from "@aragon/ods";
import { useGetVotingStartsIn } from "./hooks/useGetVotingStartsIn";
import { useGetVotingEndsIn } from "./hooks/useGetVotingEndsIn";
import { Token } from "./types/tokens";
import { useGetTotalVpCast } from "./hooks/useGetTotalVpCast";
import { formatUnits } from "viem";
import { useNow } from "./hooks/useNow";
import { EventDataList } from "@/features/events/components/eventDataList/eventDataList";

export default function PluginPage() {
  const { now, getRelativeTime } = useNow();
  const { votingStartsIn, isLoading: startInLoading } = useGetVotingStartsIn(
    Token.MODE,
    BigInt(Math.floor(now / 1000))
  );
  const { votingEndsIn, isLoading: endsInLoading } = useGetVotingEndsIn(Token.MODE, BigInt(Math.floor(now / 1000)));

  const { data: totalModeVpBn, isLoading: isTotalModeBpBnLoading } = useGetTotalVpCast(Token.MODE);
  const { data: totalBptVpBn, isLoading: isTotalBptBpBnLoading } = useGetTotalVpCast(Token.BPT);

  const totalVpLoading = isTotalModeBpBnLoading || isTotalBptBpBnLoading;

  const nextVotingDateLoading = startInLoading || endsInLoading;
  const active = !!votingEndsIn && !votingStartsIn;
  const nextVotingDateTs = Number(active ? votingEndsIn : (votingStartsIn ?? 0n)) * 1000 + now;
  const nextVotingDate = getRelativeTime(nextVotingDateTs, DateFormat.RELATIVE);

  const totalVp = formatterUtils.formatNumber(formatUnits((totalModeVpBn ?? 0n) + (totalBptVpBn ?? 0n), 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />

      <MainSection>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-8">
          <div className="relative lg:col-span-5">
            <h2 className="text-3xl font-semibold text-neutral-800">
              <span className="text-neutral-900">Vote to</span> direct incentives
            </h2>
            <SectionHeader title="" learnMoreUrl={PUB_STAKING_LEARN_MORE_URL}>
              Use your voting power to support different projects and receive incentives in return. Voting windows occur
              every 2 weeks with the deadline on Wednesday at 23:00:00 UTC.
            </SectionHeader>
            <br />
            <div className="flex flex-row gap-x-20 gap-y-6">
              <div className="flex flex-col justify-between">
                <div className=" flex items-baseline gap-x-1">
                  <span className="title text-3xl text-neutral-900 md:text-3xl">
                    {nextVotingDateLoading ? (
                      <StateSkeletonBar className="my-2 flex h-7 !bg-primary-500/20" width={120} />
                    ) : (
                      nextVotingDate
                    )}
                  </span>
                </div>
                <span className="text-md text-neutral-700">
                  {active ? "Current" : "Next"} voting {active ? "ends" : "starts"}
                </span>
              </div>

              <div className="flex flex-col justify-between">
                <div className="flex items-baseline gap-x-1">
                  <span className="title text-3xl text-neutral-900 md:text-3xl">
                    {totalVpLoading ? (
                      <StateSkeletonBar className="my-2 flex h-7 !bg-primary-500/20" width={120} />
                    ) : (
                      totalVp
                    )}
                  </span>
                </div>
                <span className="text-md text-neutral-700">Total voting power</span>
              </div>

              <div className="hidden flex-col">
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
          </div>
          <div className="relative lg:col-span-3">
            <div className="flex w-full flex-col gap-y-3">
              <h2 className="text-3xl font-semibold text-neutral-800">Upcoming events</h2>
              <EventDataList />
            </div>
          </div>
        </div>
        <br />
        <StakePositions />
      </MainSection>
    </div>
  );
}
