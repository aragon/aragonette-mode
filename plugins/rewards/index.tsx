import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { PUB_REWARDS_LEARN_MORE_URL } from "@/constants";
import { SectionHeader } from "../stake/components/section-header";
import RewardItemList from "./components/reward-item-list";
import { useGetUserTotalRewards } from "../voting/hooks/useGetUserRewards";
import { useMemo } from "react";
import { NumberFormat, StateSkeletonBar, formatterUtils } from "@aragon/ods";

export default function PluginPage() {
  const { data: userRewards, isLoading } = useGetUserTotalRewards();

  const totalUserRewards = useMemo(() => {
    return userRewards.rewards?.data.reduce((acc, reward) => acc + reward.value, 0);
  }, [userRewards.rewards?.data]);

  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />
      <MainSection>
        <div className="flex flex-col gap-y-10">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-8">
            <div className="relative lg:col-span-7">
              <h2 className="text-3xl font-semibold text-neutral-800">
                <span className="text-neutral-900">Claim your</span> rewards
              </h2>
              <SectionHeader title="" learnMoreUrl={PUB_REWARDS_LEARN_MORE_URL}>
                Each epoch, projects are distributing rewards for all their voters. Those are summerized as tokens in
                this list, and if you haven’t claimed, don’t worry, they get summed up!
              </SectionHeader>
              <br />
              <div className="flex flex-row gap-x-20 gap-y-6">
                <div className="flex flex-col">
                  <div className=" flex items-baseline gap-x-1">
                    {isLoading ? (
                      <StateSkeletonBar className="my-2 flex h-7 !bg-primary-500/20" width={120} />
                    ) : totalUserRewards && totalUserRewards !== 0 ? (
                      <span className="title text-3xl text-neutral-900 md:text-3xl">
                        {formatterUtils.formatNumber(totalUserRewards, { format: NumberFormat.FIAT_TOTAL_SHORT })}
                      </span>
                    ) : (
                      <span className="title text-3xl text-neutral-900 md:text-3xl">None</span>
                    )}
                  </div>
                  <span className="text-md text-neutral-700">Claimable rewards</span>
                </div>
              </div>
            </div>
          </div>
          <RewardItemList />
        </div>
      </MainSection>
    </div>
  );
}
