import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { useGetUserTotalRewards } from "@/plugins/voting/hooks/useGetUserRewards";
import { DataListContainer, DataListRoot, type IDataListContainerState, IconType } from "@aragon/ods";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { RewardItem } from "./reward-item";

export const RewardItemList: React.FC = () => {
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
      {orderedRewards && orderedRewards.length > 0 && (
        <div className="hidden gap-x-4 px-6 md:grid md:grid-cols-12">
          <p className="md:col-span-4">Name</p>
          <p className="text-end md:col-span-4 lg:col-span-5">Rewards</p>
          <div className="md:col-span-4 lg:col-span-3" />
        </div>
      )}
      <DataListContainer emptyState={emptyState}>
        {address &&
          orderedRewards?.map((reward) => {
            const token = tokenMetadata?.find(
              (metadata) => metadata?.address?.toLowerCase() === reward.token?.toLowerCase()
            );
            return <RewardItem key={reward.token} rewardToken={reward.token} metadata={token} userRewards={reward} />;
          })}
      </DataListContainer>
    </DataListRoot>
  );
};

export default RewardItemList;
