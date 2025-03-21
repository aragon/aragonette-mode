import type { TokenMetadataResponse } from "@/pages/api/token-metadata";
import { useGetUserRewards } from "@/plugins/voting/hooks/useGetUserRewards";
import type { Reward, RewardDatum } from "@/server/utils/api/types";
import { shortenAddress } from "@/utils/address";
import { formatRewards } from "@/utils/numbers";
import { Avatar, Button, DataListItem, IconType, NumberFormat, formatterUtils } from "@aragon/ods";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { type Address, zeroAddress } from "viem";
import { useClaimReward } from "../hooks/useClaimReward";

type GaugeItemProps = {
  rewardToken: string;
  metadata?: TokenMetadataResponse;
  userRewards: RewardDatum;
  isClaimed?: boolean;
};

export const RewardItem: React.FC<GaugeItemProps> = ({ metadata, userRewards, rewardToken, isClaimed = false }) => {
  const queryClient = useQueryClient();
  const { queryKey } = useGetUserRewards();
  const modeOrBpt = userRewards.protocol === "mode" ? "mode" : "bpt";

  const onClaimSuccess = useCallback(async () => {
    queryClient.setQueryData(queryKey, (oldData: Reward | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.filter((datum) => datum.claimMetadata.identifier !== userRewards.claimMetadata.identifier),
      };
    });
  }, [queryClient, queryKey, userRewards.claimMetadata.identifier]);

  const { claimReward, isConfirming } = useClaimReward(rewardToken, onClaimSuccess);

  const handleClaim = useCallback(async () => {
    if (isClaimed || isConfirming) return;
    await claimReward();
  }, [claimReward, isClaimed, isConfirming]);

  return (
    <DataListItem
      key={metadata?.name}
      className="mt-2 grid grid-cols-1 items-center gap-4 border border-neutral-100 p-4 md:grid-cols-12"
    >
      <div className="flex items-center gap-x-3 md:col-span-4">
        <Avatar
          alt="Gauge icon"
          size="lg"
          src={metadata?.icon_url}
          fallback={
            <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
              {metadata?.name}
            </span>
          }
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-x-2">
            <Avatar alt="Gauge icon" className="!md:size-5 !size-4" src={`/${modeOrBpt}-token-icon.png`} />
            <p className="title line-clamp-1 text-neutral-900">{metadata?.symbol}</p>
          </div>
          <p className="text-neutral-600">{shortenAddress((metadata?.address as Address) ?? zeroAddress)}</p>
        </div>
      </div>

      <div className="flex flex-col md:col-span-4 md:items-end lg:col-span-5">
        <p className="mb-1 mt-3 text-neutral-900 md:hidden">Rewards</p>
        <p>
          {formatterUtils.formatNumber(Number(userRewards.claimable), {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
          })}{" "}
          <span className="title text-xs text-neutral-600">{metadata?.symbol}</span>
        </p>
        <p>{formatRewards(userRewards.value)}</p>
      </div>

      <div className="flex justify-end md:col-span-4 lg:col-span-3">
        <Button
          size="md"
          variant="tertiary"
          iconLeft={isClaimed ? IconType.CHECKMARK : undefined}
          disabled={isConfirming || isClaimed}
          isLoading={isConfirming}
          className="btn btn-primary w-full transition-none disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          onClick={handleClaim}
        >
          {isConfirming ? "Claiming..." : isClaimed ? "Claimed" : "Claim Reward"}
        </Button>
      </div>
    </DataListItem>
  );
};
