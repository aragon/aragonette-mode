import { QueryClient } from "@tanstack/react-query";
import { PUB_WALLET_CONNECT_PROJECT_ID } from "@/constants";
import { config } from "@/context/Web3Modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { type ReactNode } from "react";
import { WagmiProvider, deserialize, serialize, type State } from "wagmi";
import { AlertProvider } from "./Alerts";
import { OdsModulesProvider } from "@aragon/ods";
import { customModulesCopy, odsCoreProviderValues } from "@/components/ods-customizations";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { hashFn } from "@wagmi/core/query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 6, // 10 minutes
      queryKeyHashFn: hashFn,
      staleTime: 250 * 60, // 15 seconds
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createAsyncStoragePersister({
  serialize,
  storage: AsyncStorage,
  deserialize,
});

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: PUB_WALLET_CONNECT_PROJECT_ID,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
  enableOnramp: false, // Optional
  themeMode: "dark",
  allWallets: "SHOW",
});

export function RootContextProvider({ children, initialState }: { children: ReactNode; initialState?: State }) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <OdsModulesProvider
          wagmiConfig={config}
          queryClient={queryClient}
          wagmiInitialState={initialState}
          coreProviderValues={odsCoreProviderValues}
          values={{ copy: customModulesCopy }}
        >
          <AlertProvider>{children}</AlertProvider>
        </OdsModulesProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
}
