import { PUB_CHAIN } from "@/constants";
import { erc20Abi, zeroAddress, type Address } from "viem";
import { useReadContracts } from "wagmi";

interface ITokenBalanceParams {
  token: Address;
  account?: Address;
}

export const useTokenInfo = (params: ITokenBalanceParams, options = {}) => {
  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId: PUB_CHAIN.id,
        address: params.token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [params.account ?? zeroAddress],
      },
      {
        chainId: PUB_CHAIN.id,
        address: params.token,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        chainId: PUB_CHAIN.id,
        address: params.token,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        chainId: PUB_CHAIN.id,
        address: params.token,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
    query: { ...options },
  });
};
