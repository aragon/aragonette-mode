import { MultisigAbi } from "@/artifacts/Multisig.sol";
import { PUB_CHAIN } from "@/constants";
import { config } from "@/context/Web3Modal";
import { logger } from "@/services/logger";
import { type Action } from "@/utils/types";
import { getBlock, getPublicClient, readContract } from "@wagmi/core";
import { getAbiItem, type Address } from "viem";
import {
  type ApprovedLogResponse,
  type ConfirmedLogResponse,
  type ProposalCreatedLogResponse,
  type ProposalData,
  type ProposalParameters,
} from "./types";

function decodeProposalResultData(data?: Array<any>): ProposalData | null {
  logger.info("Decoding data for proposal");

  if (!data?.length && data?.length != 9) return null;
  return {
    executed: data[0] as boolean,
    approvals: data[1] as number,
    parameters: data[2] as ProposalParameters,
    actions: data[3] as Array<Action>,
    allowFailureMap: data[4] as bigint,

    // new multisig data
    confirmations: data[5] as number,
    primaryMetadata: data[6] as string,
    secondaryMetadata: data[7] as string,
    firstDelayStartTimestamp: data[8] as bigint,
  };
}

export const getMultisigCanApprove = async function (
  chain: number,
  contractAddress: Address,
  proposalId: string,
  address: string
) {
  return readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "canApprove",
    args: [proposalId as any, address as Address],
  });
};

export const getMultisigIsMember = async function (chain: number, contractAddress: Address, address: string) {
  return readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "isMember",
    args: [address as Address],
  });
};

export const getMultisigCanConfirm = async function (
  chain: number,
  contractAddress: Address,
  proposalId: string,
  address: string
) {
  return readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "canConfirm",
    args: [proposalId as any, address as Address],
  });
};

export const getBlockTimestamp = async function (blockNumber: bigint) {
  return await getBlock(config, {
    chainId: PUB_CHAIN.id,
    blockNumber,
  }).then((block) => block.timestamp.toString());
};

export const getNumProposals = async function (chain: number, contractAddress: Address) {
  return await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "proposalCount",
  });
};

export const getProposalData = async function (chain: number, contractAddress: Address, proposalId: bigint) {
  logger.info(`Fetching corresponding multisig proposal (${proposalId})...`);

  return await readContract(config, {
    chainId: chain,
    address: contractAddress,
    abi: MultisigAbi,
    functionName: "getProposal",
    args: [proposalId],
  }).then((data) => decodeProposalResultData(data as any));
};

export const getProposalCreationData = async function (
  contractAddress: Address,
  proposalId: bigint,
  snapshotBlock: bigint,
  startDate: bigint
) {
  logger.info(`Fetching creation data for multisig proposal:${proposalId}`);
  const publicClient = getPublicClient(config);

  const ProposalCreatedEvent = getAbiItem({
    abi: MultisigAbi,
    name: "ProposalCreated",
  });

  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ProposalCreatedEvent,
      args: {
        proposalId: proposalId.toString(),
      } as any,
      fromBlock: snapshotBlock,
      toBlock: startDate,
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  if (!logs?.length) throw new Error("No creation logs");

  const log = logs[0];
  const block = log.blockNumber;
  const tx = log.transactionHash;

  const logData: ProposalCreatedLogResponse = log.args as ProposalCreatedLogResponse;

  const blockData = await publicClient?.getBlock({ blockNumber: block }).catch((err) => {
    logger.error("Could not fetch the proposal blocknumber", err);
  });

  if (!blockData) throw new Error("No block data");

  logger.info(`Returning creation data for multisig proposal:${proposalId}`);

  return {
    creator: logData.creator,
    tx,
    block,
    createdAt: blockData.timestamp,
  };
};

export const getApproveLogs = async function (
  contractAddress: Address,
  proposalId: bigint,
  snapshotBlock: bigint,
  endDate: bigint
) {
  const publicClient = getPublicClient(config);

  const ApprovedEvent = getAbiItem({
    abi: MultisigAbi,
    name: "Approved",
  });

  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ApprovedEvent,
      args: {
        proposalId: proposalId.toString(),
      } as any,
      fromBlock: snapshotBlock,
      toBlock: endDate,
    })
    .then((logs) => {
      if (!logs?.length) return [];
      return logs.map((log) => {
        const tx = log.transactionHash;
        const block = log.blockNumber;

        const logData: ApprovedLogResponse = log.args as ApprovedLogResponse;
        return { logData, tx, block };
      });
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  return logs;
};

export const getConfirmationLogs = async function (
  contractAddress: Address,
  proposalId: bigint,
  snapshotBlock: bigint,
  endDate: bigint
) {
  const publicClient = getPublicClient(config);

  const ConfirmationEvent = getAbiItem({
    abi: MultisigAbi,
    name: "Confirmed",
  });

  const logs = await publicClient
    ?.getLogs({
      address: contractAddress,
      event: ConfirmationEvent,
      args: {
        proposalId: proposalId.toString(),
      } as any,
      fromBlock: snapshotBlock,
      toBlock: endDate,
    })
    .then((logs) => {
      if (!logs?.length) return [];
      return logs.map((log) => {
        const tx = log.transactionHash;
        const block = log.blockNumber;

        const logData: ConfirmedLogResponse = log.args as ConfirmedLogResponse;
        return { logData, tx, block };
      });
    })
    .catch((err) => {
      logger.error("Could not fetch the proposal details", err);
    });

  return logs;
};
