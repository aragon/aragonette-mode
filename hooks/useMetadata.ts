import { fetchJsonFromIpfs } from "@/utils/ipfs";
import { type JsonValue } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";

export function useMetadata<T = JsonValue>(ipfsUri: string | undefined = "") {
  const { data, isLoading, isSuccess, error } = useQuery<T, Error>({
    queryKey: ["ipfs", ipfsUri],
    queryFn: () => fetchJsonFromIpfs(ipfsUri),
    retry: true,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: Infinity,
    enabled: !!ipfsUri,
  });

  return {
    data,
    isLoading,
    isSuccess,
    error,
  };
}
