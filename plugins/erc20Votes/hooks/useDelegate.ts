import { Erc20VotesAbi } from "@/artifacts/ERC20Votes.sol";
import { PUB_TOKEN_ADDRESS } from "@/constants";
import { type Address } from "viem";
import { useReadContract } from "wagmi";

export const useDelegate = (address: Address | undefined, options = {}) => {
  return useReadContract({
    address: PUB_TOKEN_ADDRESS,
    abi: Erc20VotesAbi,
    functionName: "delegates",
    args: [address!],
    query: { enabled: !!address, ...options },
  });
};
