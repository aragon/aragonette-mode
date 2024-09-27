import { Button, DateFormat, formatterUtils, Tag } from "@aragon/ods";
import { useBeginWithdrawal } from "../../hooks/useBeginWithdrawal";
import { useWithdraw } from "../../hooks/useWithdrawToken";
import { type Token } from "../../types/tokens";
import { useGetCooldown } from "../../hooks/useGetCooldown";
import { useCanExit } from "../../hooks/useCanExit";
import { useIsWarm } from "../../hooks/useIsWarm";

type TokenActionProps = {
  tokenId: bigint;
  token: Token;
  vp: bigint;
  created: number;
  now: number;
};

export const TokenAction = ({ tokenId, token, vp, created, now }: TokenActionProps) => {
  const diffTime = now - new Date().getTime();
  const relativeTime = formatterUtils.formatDate(created - diffTime, {
    format: DateFormat.RELATIVE,
  });
  const { beginWithdrawal, isConfirming: isConfirmingBeginWithdraw } = useBeginWithdrawal(token, tokenId);
  const { withdraw, isConfirming: isConfirmingWithdraw } = useWithdraw(token, tokenId);
  const { cooldown } = useGetCooldown(token, tokenId);
  const { canExit } = useCanExit(token, tokenId);
  const { isWarm } = useIsWarm(token, tokenId);

  const inWarmup = !vp && !isWarm;
  const inCooldown = !vp && cooldown?.exitDate;
  const claimable = !!canExit;

  if (claimable) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="Claimable" variant="success" />
        <Button size="sm" variant="secondary" onClick={withdraw} isLoading={isConfirmingWithdraw}>
          Withdraw
        </Button>
      </div>
    );
  } else if (inWarmup) {
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
    return (
      <div className="flex items-center justify-between gap-x-4">
        <div>
          <Tag label="In cooldown" variant="warning" />
          <small className="text-neutral-200">{relativeTime}</small>
        </div>
        <Button size="sm" variant="secondary" disabled={true}>
          Withdraw
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-x-4">
      <Tag label="Active" />
      <Button size="sm" variant="secondary" onClick={beginWithdrawal} isLoading={isConfirmingBeginWithdraw}>
        Enter cooldown
      </Button>
    </div>
  );
};
