import { Card, TabsContent, TabsList, TabsRoot, TabsTrigger } from "@aragon/ods";
import React from "react";
import { StakeToken } from "./tab";
import { Token } from "../../types/tokens";

export const Stake: React.FC = () => {
  return (
    <Card className="mt-4 w-full p-8">
      <TabsRoot defaultValue="mode">
        <TabsList>
          <TabsTrigger label="Stake MODE" value="mode" />
          <TabsTrigger label="Stake BPT" value="bpt" />
        </TabsList>
        <TabsContent value="mode">
          <StakeToken token={Token.MODE} />
        </TabsContent>
        <TabsContent value="bpt">
          <StakeToken token={Token.BPT} />
        </TabsContent>
      </TabsRoot>
    </Card>
  );
};
