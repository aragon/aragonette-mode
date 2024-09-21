import { Button, InputNumberMax, Toggle, ToggleGroup } from "@aragon/ods";
import { useEffect, useState } from "react";
import { type Address } from "viem";

type PercentValues = "" | "0" | "25" | "50" | "75" | "100";

interface IHeaderProps {
  name: string;
  address: Address;
  balance: bigint;
}

export const StakeToken: React.FC<IHeaderProps> = ({ name, address, balance }) => {
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
