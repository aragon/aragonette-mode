import {
  PUB_APP_DESCRIPTION,
  PUB_APP_NAME,
  PUB_CHAIN,
  PUB_PROJECT_URL,
  PUB_WALLET_CONNECT_PROJECT_ID,
  PUB_WALLET_ICON,
  PUB_WEB3_ENDPOINT,
} from "@/constants";
import { createClient } from "viem";
import { http } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

// wagmi config
const metadata = {
  name: PUB_APP_NAME,
  description: PUB_APP_DESCRIPTION,
  url: PUB_PROJECT_URL,
  icons: [PUB_WALLET_ICON],
};

export const config = defaultWagmiConfig({
  chains: [PUB_CHAIN],
  projectId: PUB_WALLET_CONNECT_PROJECT_ID,
  ssr: false,
  metadata,
  auth: {
    email: false,
    showWallets: true,
    walletFeatures: true,
  },
  client({ chain }) {
    return createClient({
      chain,
      transport: http(PUB_WEB3_ENDPOINT, { batch: true }),
    });
  },
});
