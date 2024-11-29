import { VotingEscrowAbi } from "@/artifacts/VotingEscrow.sol";
import { useAccount, useReadContracts } from "wagmi";
import { type Token } from "../types/tokens";
import { getEscrowContract } from "./useGetContract";

export function useAllOwnedTokens(token: Token[], enabled: boolean = true) {
  const { address } = useAccount();
  const escrowContracts = token.map((t) => ({
    address: getEscrowContract(t),
    abi: VotingEscrowAbi,
  }));

  const {
    data: ownedTokens,
    isLoading,
    queryKey,
  } = useReadContracts({
    contracts: escrowContracts.map(
      (contract) =>
        ({
          ...contract,
          functionName: "ownedTokens",
          args: [address!],
        }) as const
    ),
    query: {
      enabled: !!address && enabled,
      select: (results) =>
        results.map((r) => ({
          token: token[results.indexOf(r)],
          ownedTokens: r.result,
        })),
    },
  });

  return {
    data: ownedTokens,
    isLoading,
    queryKey,
  };
}
