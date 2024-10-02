import { Button, DateFormat, formatterUtils, Tag } from "@aragon/ods";
import { useBeginWithdrawal } from "../../hooks/useBeginWithdrawal";
import { useWithdraw } from "../../hooks/useWithdrawToken";
import { type Token } from "../../types/tokens";
import { useGetCooldown } from "../../hooks/useGetCooldown";
import { useCanExit } from "../../hooks/useCanExit";
import { useGetWarmingPeriod } from "../../hooks/useGetWarmingPeriod";

type TokenActionProps = {
  tokenId: bigint;
  token: Token;
  vp: bigint;
  created: number;
  now: number;
};

export const TokenAction = ({ tokenId, token, vp, created, now }: TokenActionProps) => {
  const diffTime = now - new Date().getTime();

  const { beginWithdrawal, isConfirming: isConfirmingBeginWithdraw } = useBeginWithdrawal(token, tokenId);
  const { withdraw, isConfirming: isConfirmingWithdraw } = useWithdraw(token, tokenId);
  const { cooldown } = useGetCooldown(token, tokenId);
  const { warmingPeriod } = useGetWarmingPeriod(token);
  const { canExit } = useCanExit(token, tokenId);

  const warmingPeriodDate = created + (warmingPeriod ?? 0) * 1000;

  const inWarmup = now < warmingPeriodDate;
  const inCooldown = cooldown?.exitDate;
  const claimable = !!canExit;

  if (claimable) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="Claimable" variant="critical" />
        <Button size="sm" variant="secondary" onClick={withdraw} isLoading={isConfirmingWithdraw}>
          Withdraw
        </Button>
      </div>
    );
  } else if (inWarmup) {
    const relativeTime = formatterUtils.formatDate(warmingPeriodDate - diffTime, {
      format: DateFormat.RELATIVE,
    });

    return (
      <div className="flex items-center justify-between gap-x-4">
        <div>
          <Tag label="In warmup" variant="info" />
          <small className="text-neutral-200">{relativeTime}</small>
        </div>
        <Button size="sm" variant="secondary" disabled={true}>
          Withdraw
        </Button>
      </div>
    );
  } else if (inCooldown) {
    const exitDate = Number(cooldown?.exitDate) * 1000;
    const relativeTime = formatterUtils.formatDate(exitDate - diffTime, {
      format: DateFormat.RELATIVE,
    });

    return (
      <div className="flex items-center justify-between gap-x-4">
        <div>
          <Tag label="In cooldown" variant="success" />
          <small className="text-neutral-200">{relativeTime}</small>
        </div>
        <Button size="sm" variant="secondary" disabled={true}>
          Withdraw
        </Button>
      </div>
    );
  } else if (!vp) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="Inactive" variant="neutral" />
        <Button size="sm" variant="secondary" disabled={true}>
          Claimed
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-x-4">
      <Tag label="Active" variant="primary" />
      <Button size="sm" variant="secondary" onClick={beginWithdrawal} isLoading={isConfirmingBeginWithdraw}>
        Enter cooldown
      </Button>
    </div>
  );
};
