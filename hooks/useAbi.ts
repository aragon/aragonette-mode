import { PUB_CHAIN, PUB_ETHERSCAN_API_KEY } from "@/constants";
import { type ChainName } from "@/utils/chains";
import { isAddress } from "@/utils/evm";
import { getImplementation, isProxyContract } from "@/utils/proxies";
import { whatsabi } from "@shazow/whatsabi";
import { useQuery } from "@tanstack/react-query";
import { type AbiFunction } from "abitype";
import { type Address, type PublicClient } from "viem";
import { usePublicClient } from "wagmi";

const CHAIN_NAME = PUB_CHAIN.name.toLowerCase() as ChainName;

export const useAbi = (contractAddress: Address) => {
  const publicClient = usePublicClient({ chainId: PUB_CHAIN.id });

  const { data: implementationAddress, isLoading: isLoadingImpl } = useQuery<Address | null>({
    queryKey: ["proxy-check", contractAddress, !!publicClient],
    queryFn: () => checkIfProxyContract(contractAddress, publicClient),
    retry: 4,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: Infinity,
  });

  const resolvedAddress = isAddress(implementationAddress) ? implementationAddress : contractAddress;

  const {
    data: abi,
    isLoading,
    error,
  } = useQuery<AbiFunction[], Error>({
    queryKey: ["abi", resolvedAddress ?? "", !!publicClient],
    queryFn: () => fetchAbi(resolvedAddress, publicClient),
    retry: 4,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retryOnMount: true,
    staleTime: Infinity,
  });

  return {
    abi: abi ?? [],
    isLoading: isLoading || isLoadingImpl,
    error,
    isProxy: !!implementationAddress,
    implementation: implementationAddress,
  };
};

export function checkIfProxyContract(contractAddress: Address, publicClient: PublicClient | undefined) {
  if (!contractAddress || !publicClient) return null;

  return isProxyContract(publicClient, contractAddress)
    .then((isProxy) => (isProxy ? getImplementation(publicClient, contractAddress) : null))
    .catch(() => null);
}

export async function fetchAbi(resolvedAddress: Address | null | undefined, publicClient: PublicClient | undefined) {
  if (!resolvedAddress || !isAddress(resolvedAddress) || !publicClient) {
    return [];
  }

  const abiLoader = getEtherscanAbiLoader();
  const { abi } = await whatsabi.autoload(resolvedAddress, {
    provider: publicClient,
    abiLoader,
    followProxies: false,
    enableExperimentalMetadata: true,
  });

  return abi
    .flatMap((item) =>
      item.type !== "event"
        ? ({
            name: item.name ?? "(function)",
            inputs: item.inputs ?? [],
            outputs: item.outputs ?? [],
            stateMutability: item.stateMutability ?? "payable",
            type: item.type,
          } as AbiFunction)
        : []
    )
    .sort((a, b) => {
      const a_RO = ["pure", "view"].includes(a.stateMutability);
      const b_RO = ["pure", "view"].includes(b.stateMutability);

      return a_RO ? (b_RO ? 0 : 1) : b_RO ? -1 : 0;
    });
}

export function getEtherscanAbiLoader() {
  switch (CHAIN_NAME) {
    case "mainnet":
      return new whatsabi.loaders.EtherscanABILoader({
        apiKey: PUB_ETHERSCAN_API_KEY,
      });
    case "polygon":
      return new whatsabi.loaders.EtherscanABILoader({
        apiKey: PUB_ETHERSCAN_API_KEY,
        baseURL: "https://api.polygonscan.com/api",
      });
    case "arbitrum":
      return new whatsabi.loaders.EtherscanABILoader({
        apiKey: PUB_ETHERSCAN_API_KEY,
        baseURL: "https://api.arbiscan.io/api",
      });
    case "sepolia":
      return new whatsabi.loaders.EtherscanABILoader({
        apiKey: PUB_ETHERSCAN_API_KEY,
        baseURL: "https://api-sepolia.etherscan.io/api",
      });
    case "mumbai":
      return new whatsabi.loaders.EtherscanABILoader({
        apiKey: PUB_ETHERSCAN_API_KEY,
        baseURL: "https://api-mumbai.polygonscan.com/api",
      });
    default:
      throw new Error("Unknown chain");
  }
}
