import { useAccount, useSwitchChain } from "wagmi";

interface IUseFireTransactionParams {
  onSuccess?: () => void;
}

export const useFireTransaction = (params?: IUseFireTransactionParams) => {
  const { chains, switchChain } = useSwitchChain({ mutation: { onSuccess: () => params?.onSuccess?.() } });
  const { isConnected, chainId } = useAccount();

  function fireTransaction(callback: () => void, targetChainId?: number) {
    if (isConnected && chainId) {
      if (chains.find((chain) => chain.id === chainId)) {
        callback();
      } else {
        switchChain({ chainId: targetChainId ?? chains[0].id });
      }
    } else {
      callback();
    }
  }

  return { fireTransaction };
};
