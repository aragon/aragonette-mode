import { Button, DateFormat, formatterUtils, Tag } from "@aragon/ods";
import { useBeginWithdrawal } from "../../hooks/useBeginWithdrawal";
import { useWithdraw } from "../../hooks/useWithdrawToken";
import { type Token } from "../../types/tokens";
import { useGetCooldown } from "../../hooks/useGetCooldown";
import { useCanExit } from "../../hooks/useCanExit";
import { useGetWarmingPeriod } from "../../hooks/useGetWarmingPeriod";
import { useQueryClient } from "@tanstack/react-query";
import { useGetVp } from "../../hooks/useGetVp";
import { useGetNextEpochIn } from "../../hooks/useGetNextEpochIn";
import { useApproveNFT } from "../../hooks/useApproveNFT";

type TokenActionProps = {
  tokenId: bigint;
  token: Token;
  created: number;
  now: number;
};

export const TokenAction = ({ tokenId, token, created, now }: TokenActionProps) => {
  const queryClient = useQueryClient();

  const { vp, isLoading: vpLoading, queryKey: vpQueryKey } = useGetVp(token, tokenId);
  const { cooldown, isLoading: cooldownLoading, queryKey: cooldownQueryKey } = useGetCooldown(token, tokenId);
  const { warmingPeriod, isLoading: warmingPeriodLoading } = useGetWarmingPeriod(token);
  const { nextEpochIn, isLoading: nextEpochTsLoading } = useGetNextEpochIn(token, BigInt(created / 1000));
  const { canExit, isLoading: canExitLoading, queryKey: canExitQueryKey } = useCanExit(token, tokenId);

  const { beginWithdrawal, isConfirming: isConfirmingBeginWithdraw } = useBeginWithdrawal(token, tokenId, () => {
    queryClient.invalidateQueries({ queryKey: cooldownQueryKey });
    queryClient.invalidateQueries({ queryKey: canExitQueryKey });
    queryClient.invalidateQueries({ queryKey: vpQueryKey });
    queryClient.invalidateQueries({ queryKey: ["exitQueue"] });
  });
  const { approveNFT, isConfirming: isConfirmingApproval } = useApproveNFT(token, tokenId, beginWithdrawal);

  const { withdraw, isConfirming: isConfirmingWithdraw } = useWithdraw(token, tokenId, () => {
    queryClient.invalidateQueries({ queryKey: cooldownQueryKey });
    queryClient.invalidateQueries({ queryKey: canExitQueryKey });
    queryClient.invalidateQueries({ queryKey: vpQueryKey });
    queryClient.invalidateQueries({ queryKey: ["exitQueue"] });
  });

  const diffTime = now - new Date().getTime();
  const warmingPeriodDate = created + Math.max(warmingPeriod ?? 0, Number(nextEpochIn)) * 1000;

  const inWarmup = now <= warmingPeriodDate;
  const inCooldown = cooldown?.exitDate;
  const claimable = !!canExit;

  if (vpLoading || nextEpochTsLoading || cooldownLoading || warmingPeriodLoading || canExitLoading) {
    return (
      <div className="flex items-center justify-between gap-x-4">
        <Tag label="Loading" variant="neutral" />
        <Button size="sm" variant="secondary" disabled={true} isLoading={true}>
          Loading
        </Button>
      </div>
    );
  } else if (claimable) {
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
          Unstake
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
          Unstake
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
      <Button
        size="sm"
        variant="secondary"
        onClick={approveNFT}
        isLoading={isConfirmingApproval || isConfirmingBeginWithdraw}
      >
        Unstake
      </Button>
    </div>
  );
};
