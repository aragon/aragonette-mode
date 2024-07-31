import { PUB_CHAIN } from "@/constants";
import { erc20Abi, type Address } from "viem";
import { useReadContracts } from "wagmi";

export const useTokenInfo = (token: Address, options = {}) => {
  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId: PUB_CHAIN.id,
        address: token,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        chainId: PUB_CHAIN.id,
        address: token,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        chainId: PUB_CHAIN.id,
        address: token,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
    query: { ...options },
  });
};
