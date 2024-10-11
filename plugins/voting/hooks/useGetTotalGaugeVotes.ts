import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { useReadContracts } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContracts } from "./useGetContract";
import { type Abi, type Address } from "viem";

export function useGetTotalGaugeVotes(token: Token, gauges: Address[]) {
  const { data } = useGetContracts(token);

  const voterContract = data?.voterContract.result;

  return useReadContracts({
    contracts: gauges.map((gauge) => ({
      abi: SimpleGaugeVotingAbi as Abi,
      address: voterContract,
      functionName: "gaugeVotes",
      args: [gauge],
    })),
    query: {
      enabled: !!voterContract,
      select: (results) =>
        results.map((result) => (result?.result ?? 0n) as bigint).reduce((acc, votes) => acc + votes, 0n),
    },
  });
}
