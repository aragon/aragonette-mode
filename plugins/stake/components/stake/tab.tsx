import { Button, InputNumberMax, Toggle, ToggleGroup } from "@aragon/ods";
import { useEffect, useState } from "react";
import { useGetBalance } from "../../hooks/useGetBalance";
import { Token } from "../../types/tokens";
import { formatUnits, parseUnits } from "viem";
import { NumberFormat, formatterUtils } from "@aragon/ods";
import { useStakeToken } from "../../hooks/useStakeToken";
import { useQueryClient } from "@tanstack/react-query";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { useApproveToken } from "../../hooks/useApproveToken";

type PercentValues = "" | "0" | "25" | "50" | "75" | "100";

interface IHeaderProps {
  token: Token;
  onStake?: () => void;
}

export const StakeToken: React.FC<IHeaderProps> = ({ token, onStake }) => {
  const [balanceToStake, setBalanceToStake] = useState<bigint>(0n);
  const [percentToggle, setPercentToggle] = useState<PercentValues>("0");
  const { data, queryKey: balanceQueryKey } = useGetBalance(token);
  const { queryKey: modeQueryKey } = useOwnedTokens(Token.MODE, false);
  const { queryKey: bptQueryKey } = useOwnedTokens(Token.BPT, false);
  const queryClient = useQueryClient();

  const minAmount = 100000000000000000000n;

  const { stakeToken, isConfirming: isConfirming1 } = useStakeToken(balanceToStake, token, async () => {
    await queryClient.invalidateQueries({ queryKey: balanceQueryKey });
    await queryClient.invalidateQueries({ queryKey: modeQueryKey });
    await queryClient.invalidateQueries({ queryKey: bptQueryKey });
    onStake?.();
  });

  const { approveToken, isConfirming: isConfirming2 } = useApproveToken(balanceToStake, token, stakeToken);

  const balance = data?.balance ?? 0n;
  const decimals = data?.decimals ?? 18;
  const symbol = token === Token.MODE ? "MODE" : "BPT";
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

  return (
    <div className="mt-4 flex w-full flex-col gap-4">
      <InputNumberMax
        max={Number(formatUnits(balance, decimals))}
        alert={
          balanceToStake < minAmount
            ? { message: `The amount is too low (min 100 ${symbol})`, variant: "critical" }
            : undefined
        }
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
      <Button
        className="mt-4 w-full"
        disabled={balanceToStake < minAmount}
        onClick={approveToken}
        isLoading={isConfirming1 || isConfirming2}
      >
        Stake
      </Button>
    </div>
  );
};
