import { Card, IconType, Link, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@aragon/ods";
import React from "react";
import { StakeToken } from "./tab";
import { Token } from "../../types/tokens";

interface IStakeProps {
  onStake?: () => void;
}

export const Stake: React.FC<IStakeProps> = ({ onStake }) => {
  return (
    <Card className="mt-4 w-full p-8">
      <TabsRoot defaultValue="mode">
        <TabsList>
          <TabsTrigger label="Stake MODE" value="mode" />
          <TabsTrigger label="Stake BPT" value="bpt" />
        </TabsList>
        <TabsContent value="mode">
          <StakeToken token={Token.MODE} onStake={onStake} />
        </TabsContent>
        <TabsContent value="bpt">
          <StakeToken token={Token.BPT} onStake={onStake} />
        </TabsContent>
      </TabsRoot>
      <p className="mt-5 text-center">
        Please note that you will need to wait for the warmup and cooldown periods to complete in order to unstake.
        <Link href="https://docs.balancer.finance/guides/staking" iconRight={IconType.LINK_EXTERNAL} className="pl-1">
          Learn more
        </Link>
      </p>
    </Card>
  );
};
