import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardResources } from "@/components/dashboard/resources";
import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { Stake } from "@/plugins/stake/components/stake";
import MultiplyerChart from "@/plugins/stake/components/multiplier-chart";
import { useGetBalance } from "@/plugins/stake/hooks/useGetBalance";
import { Token } from "@/plugins/stake/types/tokens";
import { formatUnits } from "viem";
import { SectionHeader } from "@/plugins/stake/components/section-header";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";

export default function StandardHome() {
  const { data } = useGetBalance(Token.MODE);

  const multVp = Math.max(data ? Number(formatUnits(data?.balance, data?.decimals)) : 1, 1);

  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />

      <MainSection>
        <DashboardHeader />
        <div className="mt-6">
          <SectionHeader title="Stake" learnMoreUrl={PUB_STAKING_LEARN_MORE_URL}>
            Stake your MODE and/or BPT tokens to increase your voting power. The longer you stake, the higher your
            voting power multiplier will be.
          </SectionHeader>
          <div className="flex w-full flex-row">
            <div className="mx-6 my-9 w-1/2">
              <MultiplyerChart amount={multVp} />
            </div>
            <div className="w-1/2">
              <Stake />
            </div>
          </div>
        </div>
        <DashboardResources />
      </MainSection>
    </div>
  );
}
