import { Card, IconType, Link, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@aragon/ods";
import React from "react";
import { StakeToken } from "./tab";
import { Token } from "../../types/tokens";
import { PUB_STAKING_LEARN_MORE_URL } from "@/constants";

interface IStakeProps {
  onStake?: () => void;
}

export const Stake: React.FC<IStakeProps> = ({ onStake }) => {
  return (
    <Card className="w-full p-8">
      <TabsRoot defaultValue="mode">
        <TabsList>
          <TabsTrigger
            className="mode-token-icon w-1/2 justify-center px-1 text-xl md:w-auto"
            label="MODE"
            value="mode"
          />
          <TabsTrigger className="bpt-token-icon w-1/2 justify-center px-1 text-xl md:w-auto" label="BPT" value="bpt" />
        </TabsList>
        <TabsContent value="mode" className="pt-4">
          <StakeToken token={Token.MODE} onStake={onStake} />
        </TabsContent>
        <TabsContent value="bpt" className="pt-4">
          <StakeToken token={Token.BPT} onStake={onStake} />
        </TabsContent>
      </TabsRoot>
      <div className="mt-5 text-center">
        <span>
          Please note that you will need to wait for the warmup and cooldown periods to complete in order to unstake.
        </span>
        <Link href={PUB_STAKING_LEARN_MORE_URL} iconRight={IconType.LINK_EXTERNAL} className="pl-1">
          Learn more
        </Link>
      </div>
    </Card>
  );
};
