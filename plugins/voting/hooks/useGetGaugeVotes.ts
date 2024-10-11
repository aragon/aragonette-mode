import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { useReadContract } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContracts } from "./useGetContract";
import { type Abi, type Address } from "viem";

export function useGetGaugeVotes(token: Token, gauge: Address) {
  const { data } = useGetContracts(token);

  const voterContract = data?.voterContract.result;

  return useReadContract({
    address: voterContract,
    abi: SimpleGaugeVotingAbi as Abi,
    functionName: "gaugeVotes",
    args: [gauge],
    query: {
      enabled: !!voterContract,
      select: (result) => result as bigint,
    },
  });
}
