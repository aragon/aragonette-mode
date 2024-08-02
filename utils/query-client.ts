import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 10, // 10 minutes
      staleTime: 1_000 * 60, // 1 minutes
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  },
});
