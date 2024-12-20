import { PUB_BASE_URL } from "@/constants";
import { type ProposalDatum } from "@/server/utils/api/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export function useGetGaugeRewards() {
  return useQuery<ProposalDatum[]>({
    queryKey: ["gaugeRewards"],
    queryFn: async () => {
      const response = await fetch(`${PUB_BASE_URL}/api/rewards`);
      const data = await response.json();
      return data;
    },
  });
}

export function useGetGaugeTotalRewards() {
  const { data: gaugeRewards, ...rest } = useGetGaugeRewards();
  const totalRewards = gaugeRewards?.reduce((acc, { totalValue }) => acc + totalValue, 0) ?? 0;
  return {
    data: {
      totalRewards,
      gauges: gaugeRewards
        ?.filter((gauge) => dayjs(gauge.proposalDeadline) > dayjs())
        ?.map(({ totalValue, ...rest }) => ({
          percentageValue: (totalValue / totalRewards) * 100,
          ...rest,
        })),
    },
    ...rest,
  };
}
