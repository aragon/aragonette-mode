import { MainSection } from "@/components/layout/main-section";
import { SpreadRow } from "@/components/layout/spread-row";
import {
  Button,
  Card,
  IconType,
  InputNumberMax,
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

      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
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

        <aside className="flex w-full flex-col gap-y-4 justify-self-center md:max-w-[370px] md:gap-y-6">
          <dl className="divide-y divide-neutral-100">
            <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
              <dt className="line-clamp-1 shrink-0 text-lg leading-tight text-neutral-800 lg:line-clamp-6">
                Your active voting power
              </dt>
            </div>

            <div className="grid grid-cols-2 gap-y-3 py-3">
              <div>MODE</div>
              <div>1234</div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 py-3">
              <div>BPT</div>
              <div>5555</div>
            </div>
            <div className="grid grid-cols-2 gap-y-3 py-3">
              <div>Total</div>
              <div>6789</div>
            </div>
          </dl>
          <div className="grid grid-cols-2 gap-3 py-3">
            <Button variant="secondary" size="md" iconRight={IconType.LINK_EXTERNAL}>
              Get more MODE
            </Button>
            <Button variant="secondary" size="md" iconRight={IconType.LINK_EXTERNAL}>
              Get more BPT
            </Button>
          </div>
        </aside>
      </div>
    </MainSection>
  );
}

// Inner

type PercentValues = "" | "0" | "25" | "50" | "75" | "100";

const StakeToken = ({ name, address, balance }: { name: string; address: Address; balance: bigint }) => {
  const [balanceToStake, setBalanceToStake] = useState<bigint>(0n);
  const [percentToggle, setPercentToggle] = useState<PercentValues>("0");

  const onBalanceEnter = (newBalance: string) => {
    const newValue = BigInt(newBalance);

    if (newValue > balance) {
      setBalanceToStake(balance);
      setPercentToggle("100");
    } else {
      setBalanceToStake(newValue);
    }
  };

  useEffect(() => {
    setBalanceToStake(0n);
    setPercentToggle("0");
  }, [balance]);

  useEffect(() => {
    if (!percentToggle) return;

    const newValue = (balance * BigInt(percentToggle)) / BigInt(100);
    setBalanceToStake(newValue);
  }, [percentToggle]);

  const stake = () => {
    alert("Unimplemented");
  };

  return (
    <div className="mt-4 flex w-full flex-col gap-4">
      <InputNumberMax
        max={Number(balance)}
        value={balanceToStake?.toString() || ""}
        onChange={(v) => onBalanceEnter(v || "0")}
      />

      <ToggleGroup
        isMultiSelect={false}
        onChange={(v) => setPercentToggle(v as PercentValues)}
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
        Stake {name}
      </Button>
    </div>
  );
};
