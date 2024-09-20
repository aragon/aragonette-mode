import { MainSection } from "@/components/layout/main-section";
import { SpreadRow } from "@/components/layout/spread-row";
import {
  Button,
  Card,
  IconType,
  InputNumber,
  Link,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Toggle,
  ToggleGroup,
} from "@aragon/ods";
import { PUB_STAKING_LEARN_MORE_LINK, PUB_MODE_TOKEN_ADDRESS, PUB_BPT_TOKEN_ADDRESS } from "@/constants";
import { useEffect, useState } from "react";
import { Address } from "viem";

export default function PluginPage() {
  return (
    <MainSection>
      <div>
        <h1 className="line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
          Stake
        </h1>
        <p className="max-w-[700px]">
          Stake your MODE and/or BPT tokens to increase your voting power. The longer you stake, the higher your voting
          power multiplier will be.
          <br />
          <Link target="_blank" href={PUB_STAKING_LEARN_MORE_LINK} variant="primary" iconRight={IconType.LINK_EXTERNAL}>
            Learn more
          </Link>
        </p>
      </div>
      <SpreadRow>
        <Card className="mt-4 w-full p-8">
          <TabsRoot defaultValue="mode">
            <TabsList>
              <TabsTrigger label="MODE" value="mode" />
              <TabsTrigger label="Both" value="both" />
              <TabsTrigger label="BPT" value="bpt" />
            </TabsList>
            <TabsContent value="mode">
              <StakeToken name="MODE" address={PUB_MODE_TOKEN_ADDRESS} balance={1234n} />
            </TabsContent>
            <TabsContent value="both">
              <div className="flex h-24 w-full items-center justify-center">Item 2 Content</div>
            </TabsContent>
            <TabsContent value="bpt">
              <StakeToken name="BPT" address={PUB_BPT_TOKEN_ADDRESS} balance={5555n} />
            </TabsContent>
          </TabsRoot>
        </Card>

        <div className="">HI</div>
      </SpreadRow>
    </MainSection>
  );
}

// Inner

type PercentValues = "" | "0" | "25" | "50" | "75" | "100";

const StakeToken = ({ name, address, balance }: { name: string; address: Address; balance: bigint }) => {
  const [balanceToStake, setBalanceToStake] = useState<bigint>();
  const [percentToggle, setPercentToggle] = useState<PercentValues>("100");

  const onBalanceEnter = (newBalance: string) => {
    const newValue = BigInt(newBalance);

    if (newValue > balance) setBalanceToStake(balance);
    else setBalanceToStake(newValue);

    setPercentToggle("");
  };

  useEffect(() => {
    if (!percentToggle) return;

    const newValue = (balance * BigInt(percentToggle)) / BigInt(100);
    setBalanceToStake(newValue);
  }, [percentToggle]);

  const stake = () => {
    alert("Unimplemented");
  };

  return (
    <div className="mt-4 flex w-full max-w-[50%] flex-col gap-4">
      <InputNumber
        value={balanceToStake?.toString() || ""}
        onChange={(v) => onBalanceEnter(v || "0")}
        placeholder={balance.toString() + " " + name}
      />

      <ToggleGroup
        isMultiSelect={false}
        onChange={(v) => setPercentToggle(v as any)}
        value={percentToggle}
        className="flex justify-between"
      >
        <Toggle value="0" label="None" className="rounded-lg" />
        <Toggle value="25" label="25%" className="rounded-lg" />
        <Toggle value="50" label="50%" className="rounded-lg" />
        <Toggle value="75" label="75%" className="rounded-lg" />
        <Toggle value="100" label="100%" className="rounded-lg" />
      </ToggleGroup>

      <p className="text-right">
        Your balance: {balance.toString()} {name}
      </p>

      <Button className="mt-4 w-full" onClick={stake}>
        Stake MODE
      </Button>
    </div>
  );
};
