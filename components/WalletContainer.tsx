import { PUB_ENS_CHAIN, PUB_WEB3_ENS_ENDPOINT } from "@/constants";
import { Wallet } from "@aragon/ods";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { createClient, http } from "viem";
import { createConfig, useAccount } from "wagmi";

export const config = createConfig({
  chains: [PUB_ENS_CHAIN],
  ssr: true,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(PUB_WEB3_ENS_ENDPOINT, { batch: true }),
    });
  },
});

const WalletContainer = () => {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  return (
    <div className="flex items-center gap-3">
      <Wallet wagmiConfig={config} user={address ? { address } : undefined} onClick={() => open()} />
    </div>
  );
};

export default WalletContainer;
