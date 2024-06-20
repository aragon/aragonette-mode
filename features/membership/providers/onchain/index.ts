import { DelegationWallAbi } from "@/artifacts/DelegationWall.sol";
import { config } from "@/context/Web3Modal";
import { readContract, getPublicClient } from "@wagmi/core";
import { Erc20VotesAbi } from "@/artifacts/ERC20Votes.sol";
import { type Address, getAbiItem } from "viem";
import { logger } from "@/services/logger";

export const getDelegatesList = async function (chain: number, contractAddress: Address) {
  return await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: DelegationWallAbi,
    functionName: "getCandidateAddresses",
  });
};

export const getDelegationCount = async function (address: Address, contractAddress: Address) {
  const publicClient = getPublicClient(config);

  /* 
  event DelegateChanged(
    address delegator,
    address fromDelegate,
    address toDelegate
  ); 
  */

  const DelegateChangedEvent = getAbiItem({
    abi: Erc20VotesAbi,
    name: "DelegateChanged",
  });

  // TODO: Scan by chunks till creation date
  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: DelegateChangedEvent,
      args: {
        toDelegate: [address],
        fromDelegate: [address],
      },
      fromBlock: BigInt(0),
      toBlock: "latest",
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  const count =
    logs?.reduce((acc, log) => {
      if (log.topics[2] === address) {
        acc += 1;
      }
      if (log.topics[1] === address) {
        acc -= 1;
      }
      return acc;
    }, 0) ?? 0;

  return Math.max(count - 1, 0); // Remove the initial delegation
};

export const getDelegateMessage = async function (chain: number, contractAddress: Address) {
  return await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: DelegationWallAbi,
    args: [contractAddress],
    functionName: "candidates",
  });
};
