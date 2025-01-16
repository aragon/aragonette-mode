import { http } from "wagmi";
import {
  PUB_APP_DESCRIPTION,
  PUB_APP_NAME,
  PUB_CHAIN,
  PUB_PROJECT_URL,
  PUB_WALLET_CONNECT_PROJECT_ID,
  PUB_WALLET_ICON,
  PUB_WEB3_ENDPOINT,
} from "@/constants";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";

const metadata = {
  name: PUB_APP_NAME,
  description: PUB_APP_DESCRIPTION,
  url: PUB_PROJECT_URL,
  icons: [PUB_WALLET_ICON],
};

export const config = defaultWagmiConfig({
  chains: [PUB_CHAIN],
  auth: {
    email: false,
    socials: [],
  },
  metadata,
  ssr: true,
  transports: {
    [PUB_CHAIN.id]: http(PUB_WEB3_ENDPOINT, { batch: true }),
  },
  projectId: PUB_WALLET_CONNECT_PROJECT_ID,
  enableWalletConnect: true,
  enableCoinbase: true,
  enableEIP6963: true,
});
