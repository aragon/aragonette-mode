import { erc20Abi, type Address } from "viem";
import { useReadContracts } from "wagmi";

interface ITokenBalanceParams {
  token: Address;
  account: Address;
}

export const useTokenBalance = (params: ITokenBalanceParams) => {
  return useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: params.token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [params.account],
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
    ],
  });
};
