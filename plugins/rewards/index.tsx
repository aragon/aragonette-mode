import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { PUB_REWARDS_LEARN_MORE_URL } from "@/constants";
import { SectionHeader } from "../stake/components/section-header";
import RewardItemList from "./components/reward-item-list";
import { useGetUserTotalRewards } from "../voting/hooks/useGetUserRewards";
import { useMemo } from "react";
import { IconType, StateSkeletonBar, Button, Link } from "@aragon/ods";
import { formatRewards } from "@/utils/numbers";
import { useGetRewardsUrl } from "../stake/hooks/useGetRewardsUrl";

export default function PluginPage() {
  const { data: userRewards, isLoading } = useGetUserTotalRewards();

  const totalUserRewards = useMemo(() => {
    return userRewards.rewards?.data.reduce((acc, reward) => acc + reward.value, 0);
  }, [userRewards.rewards?.data]);

  const { data: rewardsUrl, isLoading: isRewardsLoading } = useGetRewardsUrl();

  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />
      <MainSection>
        <div className="flex flex-col gap-y-10">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-8">
            <div className="relative flex flex-col gap-y-3 lg:col-span-5">
              <h2 className="text-3xl font-semibold text-neutral-800">
                <span className="text-neutral-900">Claim your</span> bribe rewards
              </h2>
              <SectionHeader>
                Each epoch, projects are distributing rewards for all their voters. Those are summerized as tokens in
                this list, and if you haven’t claimed, don’t worry, they get summed up!
              </SectionHeader>
              <div className="flex flex-row flex-wrap gap-x-6 gap-y-2">
                <Link
                  target="_blank"
                  href={PUB_REWARDS_LEARN_MORE_URL}
                  variant="primary"
                  iconRight={IconType.LINK_EXTERNAL}
                >
                  Learn more about rewards
                </Link>
                <Link
                  target="_blank"
                  href="https://hiddenhand.finance/mode"
                  variant="primary"
                  iconRight={IconType.LINK_EXTERNAL}
                >
                  Hidden Hand Mode
                </Link>
                <Link
                  target="_blank"
                  href="https://hiddenhand.finance/mode-bpt"
                  variant="primary"
                  iconRight={IconType.LINK_EXTERNAL}
                >
                  Hidden Hand BPT
                </Link>
              </div>
              <div className="flex flex-row gap-x-20 gap-y-6">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-x-1">
                    {isLoading ? (
                      <StateSkeletonBar className="my-2 flex h-7 !bg-primary-500/20" width={120} />
                    ) : (
                      <span className="title text-3xl text-neutral-900 md:text-3xl">
                        {formatRewards(totalUserRewards)}
                      </span>
                    )}
                  </div>
                  <span className="text-md text-neutral-700">Claimable rewards</span>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col gap-y-3 lg:col-span-3">
              <h2 className="text-3xl font-semibold text-neutral-800">
                <span className="text-neutral-900">Staking</span> Rewards
              </h2>
              <SectionHeader title="" learnMoreUrl="">
                When you stake your tokens, you earn rewards based on your share of the total stake. Head to the Rewards
                page to see how many tokens you’ve earned so far and claim them.
              </SectionHeader>
              <Button
                className="mt-6"
                isLoading={isRewardsLoading}
                href={rewardsUrl}
                target="_blank"
                variant="secondary"
                size="lg"
                responsiveSize={{ md: "lg" }}
                iconRight={IconType.LINK_EXTERNAL}
              >
                Check for Staking Rewards
              </Button>
            </div>
          </div>
          <RewardItemList />
        </div>
      </MainSection>
    </div>
  );
}
