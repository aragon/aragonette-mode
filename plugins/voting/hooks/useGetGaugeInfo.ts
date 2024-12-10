import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContracts } from "./useGetContract";
import { type Address } from "viem";

export function useGetGaugeInfo(token: Token, gauge: Address) {
  const { data } = useGetContracts(token);

  const voterContract = data?.voterContract.result;

  return useReadContract({
    abi: SimpleGaugeVotingAbi,
    address: voterContract,
    functionName: "getGauge",
    args: [gauge],
    query: {
      enabled: !!voterContract,
      select: (result) => ({
        token,
        address: gauge,
        info: result,
      }),
    },
  });
}
