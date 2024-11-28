import { VotingEscrowAbi } from "@/artifacts/VotingEscrow.sol";
import { usePublicClient, useReadContracts } from "wagmi";
import { MODE_ESCROW_CONTRACT, MODE_TOKEN_CONTRACT, BPT_ESCROW_CONTRACT, BPT_TOKEN_CONTRACT } from "@/constants";
import { Token } from "../types/tokens";
import { useQueries } from "@tanstack/react-query";
import { type Address } from "viem";

export function getEscrowContract(token: Token) {
  return token === Token.MODE ? MODE_ESCROW_CONTRACT : BPT_ESCROW_CONTRACT;
}

export function getTokenContract(token: Token) {
  return token === Token.MODE ? MODE_TOKEN_CONTRACT : BPT_TOKEN_CONTRACT;
}

export function useGetContracts(token: Token) {
  const escrowContract = getEscrowContract(token);

  const votingEscrowContract = {
    address: escrowContract,
    abi: VotingEscrowAbi,
  } as const;

  const res = useReadContracts({
    contracts: [
      {
        ...votingEscrowContract,
        functionName: "token",
      },
      {
        ...votingEscrowContract,
        functionName: "voter",
      },
      {
        ...votingEscrowContract,
        functionName: "curve",
      },
      {
        ...votingEscrowContract,
        functionName: "queue",
      },
      {
        ...votingEscrowContract,
        functionName: "clock",
      },
      {
        ...votingEscrowContract,
        functionName: "lockNFT",
      },
    ],
    query: {
      select(data) {
        return {
          tokenContract: data[0],
          voterContract: data[1],
          curveContract: data[2],
          queueContract: data[3],
          clockContract: data[4],
          lockNFTContract: data[5],
        };
      },
      gcTime: Infinity,
      staleTime: 60 * 60 * 1000,
    },
  });

  return res;
}

export function useGetContractsMulti(tokens: Token[]) {
  const publicClient = usePublicClient();
  const functionNames = ["token", "voter", "curve", "queue", "clock", "lockNFT"] as const;

  const tokenContractMap = tokens.map((token) => ({
    token,
    escrowContract: getEscrowContract(token),
  }));

  const queries = useQueries({
    queries: tokenContractMap.map(({ token, escrowContract }) => ({
      enabled: !!publicClient,
      queryKey: ["escrowContract", token],
      queryFn: async () => {
        const results = await Promise.all(
          functionNames.map(async (functionName) => {
            const result = await publicClient?.readContract({
              address: escrowContract,
              abi: VotingEscrowAbi,
              functionName,
            });
            return { functionName, result };
          })
        );
        return results.reduce(
          (acc, { functionName, result }) => ({
            ...acc,
            [`${functionName}Contract`]: result,
          }),
          {} as Record<`${(typeof functionNames)[number]}Contract`, Address>
        );
      },
    })),
    combine: (results) => {
      const data = tokenContractMap.map(({ token, escrowContract }, index) => ({
        token,
        escrowContract,
        ...(results[index]?.data ?? {}),
      }));
      const isLoading = results.some((result) => result.isLoading);
      const error = results.find((result) => result.error);
      return { data, isLoading, error };
    },
  });

  return queries;
}
