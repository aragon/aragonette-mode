import { fetchIpfsAsJson } from "@/utils/ipfs";
import { type JsonValue } from "@/utils/types";
import { useQueries, type UseQueryOptions } from "@tanstack/react-query";

export function useGetGaugeMetadata<T = JsonValue>(ipfsUris: string[]) {
  type TQueries = UseQueryOptions<T, Error>[];

  const metadata = useQueries<TQueries>({
    queries: ipfsUris.map((ipfsUri) => {
      return {
        queryKey: ["ipfs", ipfsUri ?? ""],
        queryFn: async () => {
          if (!ipfsUri) return;

          try {
            return await fetchIpfsAsJson(ipfsUri);
          } catch (error) {
            console.error("Failed to fetch IPFS metadata", error);
            throw error;
          }
        },
        retry: true,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retryOnMount: false,
        staleTime: 60,
      };
    }),
  });

  return {
    metadata,
  };
}
