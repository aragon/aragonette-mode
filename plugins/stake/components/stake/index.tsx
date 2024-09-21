import { Card, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@aragon/ods";
import React from "react";
import { StakeToken } from "./tab";
import { PUB_BPT_TOKEN_ADDRESS, PUB_MODE_TOKEN_ADDRESS } from "@/constants";

export const Stake: React.FC = () => {
  return (
    <Card className="mt-4 w-full p-8">
      <TabsRoot defaultValue="mode">
        <TabsList>
          <TabsTrigger label="Stake MODE" value="mode" />
          <TabsTrigger label="Stake BPT" value="bpt" />
        </TabsList>
        <TabsContent value="mode">
          <StakeToken name="MODE" address={PUB_MODE_TOKEN_ADDRESS} balance={1234n} />
        </TabsContent>
        <TabsContent value="bpt">
          <StakeToken name="BPT" address={PUB_BPT_TOKEN_ADDRESS} balance={5555n} />
        </TabsContent>
      </TabsRoot>
    </Card>
  );
};
