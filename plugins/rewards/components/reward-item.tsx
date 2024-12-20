import { Avatar, Button, DataListItem, formatterUtils, IconType, NumberFormat } from "@aragon/ods";
import { shortenAddress } from "@/utils/address";
import { useClaimReward } from "../hooks/useClaimReward";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserRewards } from "@/plugins/voting/hooks/useGetUserRewards";
import { type RewardDatum } from "@/server/utils/api/types";
import { type Address, formatUnits, parseUnits, zeroAddress } from "viem";
import { type TokenMetadataResponse } from "@/pages/api/token-metadata";

type GaugeItemProps = {
  rewardToken: string;
  metadata?: TokenMetadataResponse;
  userRewards: RewardDatum;
  isClaimed?: boolean;
};

export const RewardItem: React.FC<GaugeItemProps> = ({ metadata, userRewards, rewardToken, isClaimed = false }) => {
  const queryClient = useQueryClient();
  const { queryKey } = useGetUserRewards();

  const { claimReward, isConfirming } = useClaimReward(
    rewardToken,
    async () => await queryClient.invalidateQueries({ queryKey })
  );

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
          <p className="title line-clamp-1 text-neutral-900">{metadata?.name}</p>
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
        <p>{formatterUtils.formatNumber(userRewards.value, { format: NumberFormat.FIAT_TOTAL_SHORT })}</p>
      </div>

      <div className="flex justify-end md:col-span-4 lg:col-span-3">
        <Button
          size="md"
          variant="tertiary"
          iconLeft={isClaimed ? IconType.CHECKMARK : undefined}
          disabled={isConfirming}
          isLoading={isConfirming}
          className="btn btn-primary w-full transition-none disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          onClick={claimReward}
        >
          {isConfirming ? "Claiming..." : isClaimed ? "Claimed" : "Claim Reward"}
        </Button>
      </div>
    </DataListItem>
  );
};
