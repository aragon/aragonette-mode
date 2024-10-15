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
import { useEffect, useState } from "react";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";

type TokenActionProps = {
  tokenId: bigint;
  token: Token;
  created: number;
  now: number;
};

enum TokenActionStatus {
  Loading = "loading",
  Claimable = "claimable",
  InWarmup = "inWarmup",
  InCooldown = "inCooldown",
  Inactive = "inactive",
  Active = "active",
}

export const TokenAction = ({ tokenId, token, created, now }: TokenActionProps) => {
  const queryClient = useQueryClient();

  const { data: vp, isLoading: vpLoading, queryKey: vpQueryKey } = useGetVp(token, tokenId);
  const { data: cooldown, isLoading: cooldownLoading, queryKey: cooldownQueryKey } = useGetCooldown(token, tokenId);
  const { data: warmingPeriod, isLoading: warmingPeriodLoading } = useGetWarmingPeriod(token);
  const { data: nextEpochIn, isLoading: nextEpochTsLoading } = useGetNextEpochIn(token, BigInt(created / 1000));
  const { data: canExit, isLoading: canExitLoading, queryKey: canExitQueryKey } = useCanExit(token, tokenId);
  const { queryKey: ownedQueryKey } = useOwnedTokens(token, false);

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["exitQueue", token] });
    await queryClient.invalidateQueries({ queryKey: ownedQueryKey });
    await queryClient.invalidateQueries({ queryKey: canExitQueryKey });
    await queryClient.invalidateQueries({ queryKey: cooldownQueryKey });
    await queryClient.invalidateQueries({ queryKey: vpQueryKey });
  };

  const { beginWithdrawal, isConfirming: isConfirmingBeginWithdraw } = useBeginWithdrawal(
    token,
    tokenId,
    invalidateQueries
  );
  const { approveNFT, isConfirming: isConfirmingApproval } = useApproveNFT(token, tokenId, beginWithdrawal);

  const { withdraw, isConfirming: isConfirmingWithdraw } = useWithdraw(token, tokenId, invalidateQueries);

  const [status, setStatus] = useState<TokenActionStatus>(TokenActionStatus.Loading);
  const [nextPeriodDate, setNextPeriodDate] = useState(0);

  const relativeTime = formatterUtils.formatDate(nextPeriodDate, {
    format: DateFormat.RELATIVE,
  });

  const isLoading = vpLoading || cooldownLoading || warmingPeriodLoading || nextEpochTsLoading || canExitLoading;

  useEffect(() => {
    const diffTime = now - new Date().getTime();
    const warmingPeriodDate = created + Math.max(warmingPeriod ?? 0, Number(nextEpochIn)) * 1000;
    const exitDate = Number(cooldown?.exitDate) * 1000;

    const nextPeriodDate = (exitDate ? exitDate : warmingPeriodDate) - diffTime;
    setNextPeriodDate(nextPeriodDate);

    const inWarmup = now <= warmingPeriodDate;
    const inCooldown = !!exitDate;
    const claimable = !!canExit;

    if (isLoading) {
      setStatus(TokenActionStatus.Loading);
    } else if (claimable) {
      setStatus(TokenActionStatus.Claimable);
    } else if (inWarmup) {
      setStatus(TokenActionStatus.InWarmup);
    } else if (inCooldown) {
      setStatus(TokenActionStatus.InCooldown);
    } else if (!vp) {
      setStatus(TokenActionStatus.Inactive);
    } else {
      setStatus(TokenActionStatus.Active);
    }
  }, [vp, cooldown, canExit, warmingPeriod, nextEpochIn, now, created, isLoading]);

  switch (status) {
    case TokenActionStatus.Loading:
      return (
        <div className="flex items-center justify-between gap-x-4">
          <Tag label="Loading" variant="neutral" />
          <Button size="sm" variant="secondary" disabled={true} isLoading={true}>
            Loading
          </Button>
        </div>
      );
    case TokenActionStatus.Claimable:
      return (
        <div className="flex items-center justify-between gap-x-4">
          <Tag label="Claimable" variant="critical" />
          <Button size="sm" variant="secondary" onClick={withdraw} isLoading={isConfirmingWithdraw}>
            Withdraw
          </Button>
        </div>
      );
    case TokenActionStatus.InWarmup:
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
    case TokenActionStatus.InCooldown:
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
    case TokenActionStatus.Inactive:
      return (
        <div className="flex items-center justify-between gap-x-4">
          <Tag label="Inactive" variant="neutral" />
          <Button size="sm" variant="secondary" disabled={true}>
            Claimed
          </Button>
        </div>
      );
    case TokenActionStatus.Active:
      return (
        <div className="flex items-center justify-between gap-x-4">
          <Tag label="Active" variant="success" />
          <Button
            size="sm"
            variant="secondary"
            onClick={approveNFT}
            isLoading={isConfirmingApproval || isConfirmingBeginWithdraw}
          >
            Claim
          </Button>
        </div>
      );
  }
};
