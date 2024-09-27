import { MainSection } from "@/components/layout/main-section";
import { RadialGradients } from "@/components/radial-gradients";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";
import { SectionHeader } from "./components/section-header";
import { Stake } from "./components/stake";
import { StakeUserStats } from "./components/stake-user-stats";
import { StakePositions } from "./components/ve-positions-list";
import React from "react";

export default function PluginPage() {
  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />
      <MainSection>
        <SectionHeader title="Stake" learnMoreUrl={PUB_STAKING_LEARN_MORE_URL}>
          Stake and vote with your MODE and/or BPT to earn $OP. Increase your voting power by staking more tokens. The
          longer you stake, the higher your voting power multiplier will be. New stakes will be subject to a 3 day
          warmup before eligible to vote.
        </SectionHeader>
        <div className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Stake />
          <StakeUserStats />
        </div>
        <br />
        <StakePositions />
      </MainSection>
    </div>
  );
}
