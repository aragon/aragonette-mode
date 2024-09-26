import { Button, InputNumberMax, Toggle, ToggleGroup } from "@aragon/ods";
import { useEffect, useState } from "react";
import { useGetBalance } from "../../hooks/useGetBalance";
import { type Token } from "../../types/tokens";
import { formatUnits, parseUnits } from "viem";
import { NumberFormat, formatterUtils } from "@aragon/ods";
import { useStakeToken } from "../../hooks/useStakeToken";

type PercentValues = "" | "0" | "25" | "50" | "75" | "100";

interface IHeaderProps {
  token: Token;
}

export const StakeToken: React.FC<IHeaderProps> = ({ token }) => {
  const [balanceToStake, setBalanceToStake] = useState<bigint>(0n);
  const [percentToggle, setPercentToggle] = useState<PercentValues>("0");
  const { stakeToken } = useStakeToken(token);

  const { data } = useGetBalance(token);

  const balance = data?.balance ?? 0n;
  const decimals = data?.decimals ?? 18;
  const symbol = data?.symbol ?? "";
  const formattedBalance = data?.formattedBalance ?? "0";
  const formattedQuantity = formatterUtils.formatNumber(formattedBalance, { format: NumberFormat.TOKEN_AMOUNT_LONG });

  const onBalanceEnter = (newBalance: string) => {
    const newValue = parseUnits(newBalance, decimals);

    if (newValue >= balance) {
      setBalanceToStake(balance);
      setPercentToggle("100");
    } else {
      setBalanceToStake(newValue);
    }
  };

  useEffect(() => {
    setBalanceToStake(balance);
    setPercentToggle("100");
  }, [balance]);

  useEffect(() => {
    if (!percentToggle) return;

    const newValue = (BigInt(balance) * BigInt(percentToggle)) / BigInt(100);
    setBalanceToStake(newValue);
  }, [percentToggle, balance]);

  const stake = () => {
    stakeToken(balanceToStake);
  };

  return (
    <div className="mt-4 flex w-full flex-col gap-4">
      <InputNumberMax
        max={Number(formatUnits(balance, decimals))}
        value={
          formatterUtils.formatNumber(formatUnits(balanceToStake, decimals), {
            format: NumberFormat.TOKEN_AMOUNT_LONG,
          }) ?? ""
        }
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
        Your balance: {formattedQuantity} {symbol}
      </p>
      <Button className="mt-4 w-full" onClick={stake}>
        Stake
      </Button>
    </div>
  );
};
