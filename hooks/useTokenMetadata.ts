import { type TokenMetadataResponse } from "@/pages/api/token-metadata";
import { useQueries } from "@tanstack/react-query";

export function useTokenMetadata(tokenAddresses: string[]) {
  return useQueries({
    queries: tokenAddresses.map((address) => ({
      queryKey: ["tokenMetadata", address],
      queryFn: async () => {
        const response = await fetch("/api/token-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tokenAddress: address }),
        });
        const data = await response.json();
        return data as TokenMetadataResponse;
      },
    })),
    combine: (results) => {
      const data = results.map((result) => result.data);
      const isLoading = results.some((result) => result.isLoading);
      const isError = results.some((result) => result.isError);
      return { data, isLoading, isError };
    },
  });
}
