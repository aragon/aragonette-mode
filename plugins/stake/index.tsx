import { MainSection } from "@/components/layout/main-section";
import { SpreadRow } from "@/components/layout/spread-row";
import {
  Button,
  Card,
  DataListContainer,
  DataListFilter,
  DataListItem,
  DataListRoot,
  IconType,
  InputNumberMax,
  Link,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Tag,
  Toggle,
  ToggleGroup,
} from "@aragon/ods";
import {
  PUB_STAKING_LEARN_MORE_URL,
  PUB_MODE_TOKEN_ADDRESS,
  PUB_BPT_TOKEN_ADDRESS,
  PUB_GET_MORE_MODE_URL,
  PUB_GET_MORE_BPT_URL,
  PUB_VE_TOKENS_LEARN_MORE_URL,
} from "@/constants";
import { ReactNode, useEffect, useState } from "react";
import { Address } from "viem";
import { RadialGradients } from "@/components/radial-gradients";

export default function PluginPage() {
  return (
    <div className="bg-gradient-to-b from-neutral-0 to-transparent">
      <RadialGradients />

      <MainSection>
        <StakeRow />
        <br />
        <VeTokensTable />
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
            <Button href={PUB_GET_MORE_MODE_URL} variant="secondary" size="md" iconRight={IconType.LINK_EXTERNAL}>
              Get more MODE
            </Button>
            <Button href={PUB_GET_MORE_BPT_URL} variant="secondary" size="md" iconRight={IconType.LINK_EXTERNAL}>
              Get more BPT
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
};

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

// VE Tokens

const VeTokensTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const veTokens = [
    { id: "501", amount: BigInt(1234), multiplyer: 2.5, age: 13251234, status: "in-cooldown" },
    { id: "505", amount: BigInt(300), multiplyer: 3.5, age: 15251234, status: "claimable" },
  ];

  return (
    <>
      <SectionHeader title="Your ve Tokens" learnMoreUrl={PUB_VE_TOKENS_LEARN_MORE_URL}>
        Your staked MODE and/or BPT tokens are represented as veTokens. If you want to unstake your MODE and/or BPT
        tokens, they will be available within 7 days after entering the cooldown.
      </SectionHeader>

      <div className="mt-8">
        <DataListRoot entityLabel="Users" className="gap-y-6">
          <DataListFilter
            searchValue={searchValue}
            placeholder="Filter by staked position, amount or token"
            onSearchValueChange={(v) => setSearchValue(v || "")}
          />

          <div className="flex gap-x-4 px-4">
            <div className="w-14 flex-auto">veToken ID</div>
            <div className="w-32 flex-auto">Amount</div>
            <div className="w-48 flex-auto">Multiplier</div>
            <div className="w-32 flex-auto">Age</div>
            <div className="w-48 flex-auto">Status</div>
          </div>

          <DataListContainer>
            {veTokens.map((token, idx) => (
              <Card key={idx} className="flex items-center gap-x-4 border border-neutral-100 p-4">
                <div className="w-14 flex-auto">{token.id}</div>
                <div className="w-32 flex-auto">{token.amount}</div>
                <div className="w-48 flex-auto">{token.multiplyer}x</div>
                <div className="w-32 flex-auto">
                  5 epochs
                  <br />4 days
                </div>
                <div className="w-48 flex-auto">
                  <div className="flex items-center gap-x-4">
                    <Tag label="Active" />
                    <Button size="sm" variant="secondary">
                      Enter cooldown
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </DataListContainer>
        </DataListRoot>
      </div>
    </>
  );
};

// Other

const SectionHeader = ({
  title,
  children,
  learnMoreUrl,
}: {
  title: string;
  children: ReactNode;
  learnMoreUrl: string;
}) => {
  return (
    <div className="flex flex-col gap-y-3">
      <h1 className="line-clamp-1 flex flex-1 shrink-0 text-2xl font-normal leading-tight text-neutral-800 md:text-3xl">
        {title}
      </h1>
      <p className="max-w-[700px]">{children}</p>
      <Link target="_blank" href={learnMoreUrl} variant="primary" iconRight={IconType.LINK_EXTERNAL}>
        Learn more
      </Link>
    </div>
  );
};
