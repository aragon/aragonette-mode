import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { WalletFork } from "./WalletFork";

export const WalletContainer = () => {
  const { open } = useWeb3Modal();
  const { address } = useAccount();

  // forked wallet forces an ENS chain
  return <WalletFork user={address ? { address } : undefined} onClick={() => open()} />;
};
