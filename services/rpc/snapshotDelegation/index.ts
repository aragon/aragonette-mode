import { Erc20VotesAbi } from "@/artifacts/ERC20Votes.sol";
import { SnapshotDelegationAbi } from "@/artifacts/SnapshotDelegation.sol";
import { PUB_CHAIN, PUB_SNAPSHOT_DELEGATION_ADDRESS, PUB_TOKEN_ADDRESS, SNAPSHOT_SPACE } from "@/constants";
import { config } from "@/context/Web3Modal";
import { logger } from "@/services/logger";
import { getPublicClient, readContract } from "@wagmi/core";
import { decodeEventLog, getAbiItem, stringToBytes, toHex, zeroAddress, type Address } from "viem";

export const getSnapshotDelegateSpace = async function (address: Address) {
  logger.info(`Fetching delegate space for address ${address}...`);

  const spaceId = toHex(stringToBytes(SNAPSHOT_SPACE, { size: 32 }));
  const globalId = toHex(stringToBytes("", { size: 32 }));

  const spaceDelegation = await readContract(config, {
    chainId: PUB_CHAIN.id,
    address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
    abi: SnapshotDelegationAbi,
    functionName: "delegation",
    args: [address, spaceId],
  });

  return spaceDelegation !== zeroAddress ? spaceId : globalId;
};

export const getSnapshotDelegators = async function (address: Address) {
  const publicClient = getPublicClient(config);

  const SetDelegateEvent = getAbiItem({
    abi: SnapshotDelegationAbi,
    name: "SetDelegate",
  });

  const ClearDelegateEvent = getAbiItem({
    abi: SnapshotDelegationAbi,
    name: "ClearDelegate",
  });

  const setDelegateLogs = await publicClient
    ?.getLogs({
      address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
      event: SetDelegateEvent,
      fromBlock: BigInt(0),
      toBlock: "latest",
      args: {
        delegate: address,
      },
    })
    .catch((err) => {
      logger.error(`Could not fetch the delegation for ${address}`, err);
    });

  const clearDelegateLogs = await publicClient
    ?.getLogs({
      address: PUB_SNAPSHOT_DELEGATION_ADDRESS,
      event: ClearDelegateEvent,
      fromBlock: BigInt(0),
      toBlock: "latest",
      args: {
        delegate: address,
      },
    })
    .catch((err) => {
      logger.error(`Could not fetch the delegation for ${address}`, err);
    });

  const parsedSetLogs =
    setDelegateLogs?.flatMap((log) => {
      return {
        event: decodeEventLog({ abi: SnapshotDelegationAbi, data: log.data, topics: log.topics }),
        blockNumber: Number(log.blockNumber),
      };
    }) ?? [];

  const parsedClearLogs =
    clearDelegateLogs?.flatMap((log) => {
      return {
        event: decodeEventLog({ abi: SnapshotDelegationAbi, data: log.data, topics: log.topics }),
        blockNumber: Number(log.blockNumber),
      };
    }) ?? [];

  const parsedLogs = [...parsedSetLogs, ...parsedClearLogs].filter(
    (log) =>
      log.event.args.id === toHex(stringToBytes(SNAPSHOT_SPACE, { size: 32 })) ||
      log.event.args.id === toHex(stringToBytes("", { size: 32 }))
  );
  parsedLogs.sort((a, b) => a.blockNumber - b.blockNumber);

  const delegators: Address[] =
    parsedLogs?.reduce((acc, log) => {
      if (log.event.eventName === SetDelegateEvent.name) {
        acc.push(log.event.args.delegator);
      } else if (log.event.eventName === ClearDelegateEvent.name) {
        acc = acc.filter((delegator) => delegator !== log.event.args.delegator);
      }
      return acc;
    }, [] as Address[]) ?? [];

  // Remove possible duplicates due to global and space delegations
  const uniqueDelegators = [...new Set(delegators)];

  const delegatorsWithVp = await Promise.all(
    uniqueDelegators.map(async (delegator) => {
      const delegatorVp = await readContract(config, {
        chainId: PUB_CHAIN.id,
        address: PUB_TOKEN_ADDRESS,
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
