import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { usePublicClient } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContracts } from "./useGetContract";
import { type Address } from "viem";
import { useQueries } from "@tanstack/react-query";

export function useGetGaugeVotesMulti(token: Token, gauges: Address[]) {
  const { data } = useGetContracts(token);
  const publicClient = usePublicClient();

  const voterContract = data?.voterContract.result;

  const queries = useQueries({
    queries: gauges.map((gauge) => ({
      queryKey: ["gaugeVotes", gauge, token],
      queryFn: async () => {
        if (!publicClient || !voterContract) return;
        return {
          address: gauge,
          amount: await publicClient?.readContract({
            address: voterContract,
            abi: SimpleGaugeVotingAbi,
            functionName: "gaugeVotes",
            args: [gauge],
          }),
        };
      },
    })),
    combine: (results) => {
      const data = results.map((result) => result.data);
      const isLoading = results.some((result) => result.isLoading);
      const error = results.find((result) => result.error);
      return { data, isLoading, error };
    },
  });
  return queries;
}
