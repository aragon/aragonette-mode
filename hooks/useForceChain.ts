import { PUB_CHAIN } from "@/constants";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useSwitchChain } from "wagmi";

interface IForceChainParams {
  chainId?: number;
  onSuccess: () => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
}

export const useForceChain = () => {
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  function forceChain({ chainId = PUB_CHAIN.id, onSuccess, onError, onSettled }: IForceChainParams) {
    if (!isConnected) {
      open();
    } else {
      switchChain({ chainId }, { onSuccess, onError, onSettled });
    }
  }

  return { forceChain };
};
