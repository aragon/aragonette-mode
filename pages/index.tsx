import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardResources } from "@/components/dashboard/resources";
import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { Stake } from "@/plugins/stake/components/stake";
import MultiplierChart from "@/plugins/stake/components/multiplier-chart";
import { useGetBalance } from "@/plugins/stake/hooks/useGetBalance";
import { Token } from "@/plugins/stake/types/tokens";
import { formatUnits } from "viem";
import { SectionHeader } from "@/plugins/stake/components/section-header";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";
import GetMoreTokens from "@/plugins/stake/components/get-tokens-links";

export default function StandardHome() {
  const token = Token.MODE;
  const { data } = useGetBalance(token);

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
          <div className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <div className="mx-3 mb-6 mt-10">
              <MultiplierChart amount={multVp} token={token} />
            </div>
            <div className="mx-3 mb-6">
              <Stake />
              <div className="mx-2 mt-4">
                <GetMoreTokens />
              </div>
            </div>
          </div>
        </div>
        <DashboardResources />
      </MainSection>
    </div>
  );
}
