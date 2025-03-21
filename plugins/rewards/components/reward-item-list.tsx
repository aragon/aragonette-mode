import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { useGetUserTotalRewards } from "@/plugins/voting/hooks/useGetUserRewards";
import { DataListContainer, DataListRoot, type IDataListContainerState, IconType } from "@aragon/ods";
import { useRouter } from "next/navigation";
import { type FC, useMemo } from "react";
import { useAccount } from "wagmi";
import { RewardItem } from "./reward-item";

const RewardItemSkeleton = () => {
  return (
    <div className="mt-2 grid w-full cursor-default grid-cols-1 items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4 px-4 py-3 text-left outline-none transition-all focus:outline-none md:grid-cols-12 md:px-6 md:py-3.5">
      <span className="flex items-center gap-x-3 md:col-span-4">
        <span className="flex size-10 shrink-0 animate-pulse items-center justify-center overflow-hidden rounded-full bg-neutral-100" />
        <span className="flex flex-col">
          <span className="h-5 w-16 animate-pulse rounded bg-neutral-100" />
          <span className="mt-1 h-4 w-24 animate-pulse rounded bg-neutral-100" />
        </span>
      </span>

      <span className="flex flex-col md:col-span-4 md:items-end lg:col-span-5">
        <span className="mb-1 mt-3 h-4 w-16 animate-pulse rounded bg-neutral-100 md:hidden" />
        <span className="h-4 w-12 animate-pulse rounded bg-neutral-100" />
        <span className="mt-1 h-4 w-16 animate-pulse rounded bg-neutral-100" />
      </span>

      <span className="flex justify-end md:col-span-4 lg:col-span-3">
        <span className="flex h-10 w-full min-w-32 animate-pulse items-center justify-center rounded-xl bg-neutral-100 px-3 transition-none disabled:cursor-not-allowed disabled:opacity-50 md:w-auto" />
      </span>
    </div>
  );
};

export const RewardItemList: FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { data: userRewards, isLoading } = useGetUserTotalRewards();
  const { data: tokenMetadata, isLoading: tokenMetadataIsLoading } = useTokenMetadata(
    userRewards?.rewards?.data.map((reward) => reward.token) ?? []
  );

  const loadingRewards = isLoading || tokenMetadataIsLoading;

  const emptyState: IDataListContainerState = {
    heading: "No rewards available",
    description: "At the moment there are no rewards available for you. Please check back later!",
    primaryButton: {
      label: "Start voting to earn rewards",
      iconLeft: IconType.APP_PROPOSALS,
      onClick: () => router.push("/plugins/voting"),
    },
  };

  const orderedRewards = useMemo(() => {
    return userRewards.rewards?.data.sort((a, b) => b.value - a.value);
  }, [userRewards.rewards?.data]);

  return (
    <DataListRoot
      entityLabel="Rewards"
      itemsCount={orderedRewards?.length}
      pageSize={orderedRewards?.length}
      className="mb-12"
      state={loadingRewards ? "initialLoading" : "idle"}
    >
      {((orderedRewards && orderedRewards.length > 0) || isLoading) && (
        <div className="hidden gap-x-4 px-6 md:grid md:grid-cols-12">
          <p className="md:col-span-4">Name</p>
          <p className="text-end md:col-span-4 lg:col-span-5">Rewards</p>
          <div className="md:col-span-4 lg:col-span-3" />
        </div>
      )}
      <DataListContainer emptyState={emptyState} SkeletonElement={RewardItemSkeleton}>
        {address &&
          orderedRewards?.map((reward) => {
            const token = tokenMetadata?.find(
              (metadata) => metadata?.address?.toLowerCase() === reward.token?.toLowerCase()
            );
            return (
              <RewardItem
                key={`${reward.token}-${reward.protocol}`}
                rewardToken={reward.token}
                metadata={token}
                userRewards={reward}
              />
            );
          })}
      </DataListContainer>
    </DataListRoot>
  );
};

export default RewardItemList;
