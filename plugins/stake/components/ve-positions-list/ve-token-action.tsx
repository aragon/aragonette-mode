import { Button, DateFormat, formatterUtils, Tag } from "@aragon/ods";
import { useBeginWithdrawal } from "../../hooks/useBeginWithdrawal";
import { useWithdraw } from "../../hooks/useWithdrawToken";
import { type Token } from "../../types/tokens";

type TokenActionProps = {
  tokenId: bigint;
  token: Token;
  vp: bigint;
  created: Date;
};

export const TokenAction = ({ tokenId, token, vp, created }: TokenActionProps) => {
  const relativeTime = formatterUtils.formatDate(created.getTime(), {
    format: DateFormat.RELATIVE,
  });
  const { beginWithdrawal } = useBeginWithdrawal(token, tokenId);
  const { withdraw } = useWithdraw(token, tokenId);

  const inWarmup = false; //created.getTime() > Date.now();
  const inCooldown = false; //!vp;

  const claimable = true;

  if (claimable) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="Claimable" variant="success" />
        <Button size="sm" variant="secondary" onClick={withdraw}>
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
      <Button size="sm" variant="secondary" onClick={beginWithdrawal}>
        Enter cooldown
      </Button>
    </div>
  );
};
