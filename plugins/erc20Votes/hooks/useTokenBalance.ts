import { erc20Abi, zeroAddress, type Address } from "viem";
import { useReadContracts } from "wagmi";

interface ITokenBalanceParams {
  token: Address;
  account: Address;
}

// Todo: rename
export const useTokenBalance = (params: ITokenBalanceParams) => {
  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: params.token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [params.account ?? zeroAddress],
      },
      {
        address: params.token,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address: params.token,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: params.token,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
  });
};
