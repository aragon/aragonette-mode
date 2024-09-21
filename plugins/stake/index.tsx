import { MainSection } from "@/components/layout/main-section";

import { RadialGradients } from "@/components/radial-gradients";

import { Stake } from "./components/stake";
import { StakeUserStats } from "./components/stake-user-stats";
import { StakePositions } from "./components/ve-positions";
import { SectionHeader } from "./components/section-header";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";

export default function PluginPage() {
  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />

      <MainSection>
        <StakeRow />
        <br />
        <StakePositions />
      </MainSection>
    </div>
  );
}

// Inner

const StakeRow = () => {
  return (
    <>
      <SectionHeader title="Stake" learnMoreUrl={PUB_STAKING_LEARN_MORE_URL}>
        Stake your MODE and/or BPT tokens to increase your voting power. The longer you stake, the higher your voting
        power multiplier will be.
      </SectionHeader>

      <div className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <Stake />
        <StakeUserStats />
      </div>
    </>
  );
};

// VE Tokens
