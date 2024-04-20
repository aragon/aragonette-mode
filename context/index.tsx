import { PUB_WALLET_CONNECT_PROJECT_ID } from "@/constants";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { config } from "@/context/Web3Modal";
import { queryClient } from "@/utils/query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { type ReactNode } from "react";
import { WagmiProvider, deserialize, serialize, type State } from "wagmi";
import { AlertProvider } from "./Alerts";

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
});

export function RootContextProvider({ children, initialState }: { children: ReactNode; initialState?: State }) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <AlertProvider>{children}</AlertProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </WagmiProvider>
  );
}
