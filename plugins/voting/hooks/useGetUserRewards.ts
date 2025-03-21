import type { Reward } from "@/server/utils/api/types";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function useGetUserRewards() {
  const { address } = useAccount();
  const queryOpts = queryOptions<Reward>({
    queryKey: ["userRewards", address],
    enabled: !!address,
    queryFn: async () => {
      const response = await fetch("/api/rewards/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress: address }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user rewards");
      }

      return response.json();
    },
  });

  return {
    ...useQuery(queryOpts),
    queryKey: queryOpts.queryKey,
  };
}

export function useGetUserTotalRewards() {
  const { data: userRewards, ...rest } = useGetUserRewards();
  const totalRewards = userRewards?.data?.reduce((acc, { value }) => acc + Number(value), 0) ?? 0;

  return {
    data: {
      totalRewards,
      rewards: userRewards,
    },
    ...rest,
  };
}
