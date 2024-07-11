import { PUB_ENS_CHAIN, PUB_WEB3_ENDPOINT } from "@/constants";
import { Wallet } from "@aragon/ods";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { createClient, http } from "viem";
import { createConfig, useAccount, useEnsName } from "wagmi";

export const config = createConfig({
  chains: [PUB_ENS_CHAIN],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(PUB_WEB3_ENDPOINT, { batch: true }),
    });
  },
});

export const WalletContainer = () => {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  const { data: ensName } = useEnsName({
    config,
    chainId: PUB_ENS_CHAIN.id,
    address: address,
  });

  return <Wallet user={address ? { address: address, name: ensName ?? "" } : undefined} onClick={() => open()} />;
};
