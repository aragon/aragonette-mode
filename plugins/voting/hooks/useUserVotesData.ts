import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { useAccount, usePublicClient } from "wagmi";
import { type Token } from "../types/tokens";
import { useGetContractsMulti } from "./useGetContract";
import { type Address } from "viem";
import { useAllOwnedTokens } from "./useAllOwnedTokens";
import { useQueries } from "@tanstack/react-query";

export function useUserVotesData(tokenList: Token[], gaugeAddresses: Address[][]) {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data: ownedTokensData } = useAllOwnedTokens(tokenList);
  const { data: contractsData } = useGetContractsMulti(tokenList);

  const ownedTokens =
    ownedTokensData?.flatMap(
      ({ token, ownedTokens }) =>
        ownedTokens?.map((ownedToken) => {
          const matchingContract = contractsData.find((contract) => contract.token === token);
          return {
            ownedToken,
            token,
            voterContract: matchingContract?.voterContract,
          };
        }) ?? []
    ) ?? [];

  const tokenVotesQueries = useQueries({
    queries: ownedTokens.flatMap((ownedToken) => {
      const tokenIndex = tokenList.findIndex((t) => t === ownedToken.token);
      const gaugesForToken = gaugeAddresses[tokenIndex] || [];

      return gaugesForToken.map((gaugeAddress) => ({
        queryKey: ["userVotes", ownedToken.ownedToken, gaugeAddress],
        queryFn: async () => {
          if (!publicClient || !ownedToken.voterContract || !address) return;
          return {
            token: ownedToken.token,
            ownedToken: ownedToken.ownedToken,
            gaugeAddress,
            votes: await publicClient?.readContract({
              address: ownedToken.voterContract,
              abi: SimpleGaugeVotingAbi,
              functionName: "votes",
              args: [ownedToken.ownedToken, gaugeAddress],
            }),
          };
        },
      }));
    }),
    combine: (results) => {
      const data = results.map((result) => result.data);
      const isLoading = results.some((result) => result.isLoading);
      const error = results.find((result) => result.error);
      return { data, isLoading, error };
    },
  });

  return tokenVotesQueries;
}
