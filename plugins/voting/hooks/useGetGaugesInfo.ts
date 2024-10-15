import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { useReadContracts } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContracts } from "./useGetContract";
import { type Address } from "viem";
import { type GaugeInfo } from "../components/gauges-list/types";

export function useGetGaugesInfo(token: Token, gauges: Address[]) {
  const { data } = useGetContracts(token);

  const voterContract = data?.voterContract.result;

  return useReadContracts({
    contracts: gauges.map((gauge) => ({
      abi: SimpleGaugeVotingAbi,
      address: voterContract,
      functionName: "getGauge",
      args: [gauge],
    })),
    query: {
      enabled: !!voterContract,
      select: (results) =>
        results.map((result, idx) => ({
          token,
          address: gauges[idx],
          info: result.result as GaugeInfo,
        })),
    },
  });
}
