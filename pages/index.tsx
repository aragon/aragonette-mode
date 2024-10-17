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
import Router from "next/router";
import { Card } from "@aragon/ods";

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
          <Card className="mt-8 grid w-full grid-cols-1 px-3 pb-5 md:grid-cols-2">
            <div className="-mx-3">
              <Stake onStake={() => Router.push("/plugins/stake")} />
              <div className="mx-8 mb-2">
                <GetMoreTokens />
              </div>
            </div>
            <div className="mt-3 md:mt-12">
              <MultiplierChart amount={multVp} token={token} />
            </div>
          </Card>
        </div>
        <DashboardResources />
      </MainSection>
    </div>
  );
}
