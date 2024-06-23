import { DelegationWallAbi } from "@/artifacts/DelegationWall.sol";
import { config } from "@/context/Web3Modal";
import { readContract, getPublicClient } from "@wagmi/core";
import { Erc20VotesAbi } from "@/artifacts/ERC20Votes.sol";
import { type Address, getAbiItem, decodeEventLog } from "viem";
import { logger } from "@/services/logger";

export const getDelegatesList = async function (chain: number, contractAddress: Address): Promise<Address[]> {
  return (await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: DelegationWallAbi,
    functionName: "getCandidateAddresses",
  })) as Address[];
};

export const getDelegations = async function (chain: number, address: Address, contractAddress: Address) {
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
      fromBlock: BigInt(0),
      toBlock: "latest",
    })
    .catch((err) => {
      logger.error(`Could not fetch the delegation count for ${address}`, err);
    });

  const parsedLogs = logs?.flatMap((log: any) =>
    decodeEventLog({ abi: Erc20VotesAbi, data: log.data, topics: log.topics })
  ) as any[];

  const delegators: Address[] =
    parsedLogs?.reduce((acc, log) => {
      if (log.args.toDelegate === address) {
        if (!acc.includes(log.args.delegator) && log.args.delegator !== address) acc.push(log.args.delegator);
      }
      if (log.args.fromDelegate === address) {
        const index = acc.indexOf(log.args.delegator);
        if (index > -1) {
          acc.splice(index, 1);
        }
      }
      return acc;
    }, [] as Address[]) ?? [];

  const delegatorsWithVp = await Promise.all(
    delegators.map(async (delegator) => {
      const delegatorVp = await readContract(config, {
        chainId: chain,
        address: contractAddress,
        abi: Erc20VotesAbi,
        args: [delegator],
        functionName: "balanceOf",
      });
      return {
        address: delegator.toString(),
        votingPower: delegatorVp.toString(),
      };
    })
  );

  return delegatorsWithVp;
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
