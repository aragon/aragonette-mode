import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { PUB_BASE_URL } from "@/constants";
import { type ProposalDatum } from "@/server/utils/api/types";
import { Token } from "../types/tokens";

type RewardItem = ProposalDatum;

export function useGetGaugeRewards(token: Token): UseQueryResult<RewardItem[], Error> {
  const tokenPath = token === Token.MODE ? "mode" : "bpt";

  return useQuery({
    queryKey: ["gaugeRewards", token],
    queryFn: async () => {
      const response = await fetch(`/api/rewards/${tokenPath}`);
      const json = await response.json();
      return json.data;
    },
  });
}
