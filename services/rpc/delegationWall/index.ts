import { DelegationWallAbi } from "@/artifacts/DelegationWall.sol";
import { Erc20VotesAbi } from "@/artifacts/ERC20Votes.sol";
import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_DELEGATION_CONTRACT_ADDRESS } from "@/constants";
import { config } from "@/context/Web3Modal";
import { type IDelegationWallMetadata } from "@/plugins/delegateAnnouncer/utils/types";
import { logger } from "@/services/logger";
import { fetchJsonFromIpfs } from "@/services/ipfs";
import { getPublicClient, readContract } from "@wagmi/core";
import { decodeEventLog, getAbiItem, type Address } from "viem";
import { type IProviderVotingActivity } from "@/server/client/types/domain";

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

  // Filter out the delegator if they have no voting power
  return delegatorsWithVp.filter((delegator) => delegator.votingPower !== "0");
};

export const getDelegateMessage = async function (chain: number, delegate: Address) {
  const [messageIPFSCid] = await readContract(config, {
    chainId: chain,
    address: PUB_DELEGATION_CONTRACT_ADDRESS,
    abi: DelegationWallAbi,
    args: [delegate],
    functionName: "candidates",
  });

  return (await fetchJsonFromIpfs(messageIPFSCid)) as IDelegationWallMetadata;
};

export const getMultisigVotingActivity = async function (
  address: Address,
  contractAddress: Address
): Promise<IProviderVotingActivity[]> {
  const publicClient = getPublicClient(config);

  // event Approved(uint256 indexed proposalId, address indexed approver);
  const ApprovedEvent = getAbiItem({
    abi: MultisigAbi,
    name: "Approved",
  });

  // TODO: Scan by chunks till creation date
  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ApprovedEvent,
      fromBlock: BigInt(0),
      toBlock: "latest",
      args: {
        approver: address,
      },
    })
    .catch((err) => {
      logger.error(`Could not fetch the approvals from ${address}`, err);
    });

  if (!logs) return [];

  const logsWithTimestamp = await Promise.all(
    logs.map(async (log) => {
      const blockData = await publicClient?.getBlock({ blockNumber: log.blockNumber }).catch((err) => {
        logger.error("Could not fetch the proposal blocknumber", err);
      });

      return {
        ...log,
        blockTimestamp: new Date(Number(blockData?.timestamp) * 1000).toISOString(),
      };
    })
  );

  return parseMultisigVotingActivity(logsWithTimestamp);
};

const parseMultisigVotingActivity = (data: any[]): IProviderVotingActivity[] => {
  return data.map((vote) => {
    return {
      id: `${vote.args.proposalId.toString()}-${vote.args.approver}`,
      choice: "approve",
      providerId: vote.args.proposalId.toString(),
      createdAt: vote.blockTimestamp,
    };
  });
};
