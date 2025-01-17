import { PublicClient, Block } from "viem";
import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/utils/api/serverClient";
import { CONTRACTS_DEPLOYMENT_BLOCK } from "@/constants";

async function findBlockByTimestampLimited(
  client: PublicClient,
  targetTimestamp: number,
  startBlock?: bigint,
  endBlock?: bigint,
  maxIterations: number = 22, // 2 ^ 22 = 4.2 million blocks
  timeThreshold: number = 10 // In seconds
): Promise<{ blockNumber: number; timestamp: number; exact: boolean }> {
  // Fetch the start and end block dynamically if not provided
  if (!startBlock) {
    startBlock = CONTRACTS_DEPLOYMENT_BLOCK;
  }
  if (!endBlock) {
    endBlock = await client.getBlockNumber(); // Fetch latest block number
  }

  let closestBlock: { blockNumber: bigint; timestamp: number } | null = null;
  let iterations = 0;

  while (startBlock! <= endBlock && iterations < maxIterations) {
    iterations++;
    const midBlock: bigint = startBlock! + (endBlock - startBlock!) / 2n;

    // Fetch block details
    const block: Block | null = await client.getBlock({ blockNumber: midBlock });
    if (!block || !block.timestamp) {
      throw new Error(`Block ${midBlock} not found or missing timestamp`);
    }

    const blockTimestamp = Number(block.timestamp);

    if (blockTimestamp === targetTimestamp) {
      // Exact match
      return { blockNumber: Number(midBlock), timestamp: blockTimestamp, exact: true };
    } else if (blockTimestamp < targetTimestamp) {
      // Target timestamp is later; adjust startBlock
      startBlock = midBlock + 1n;
      closestBlock = { blockNumber: midBlock, timestamp: blockTimestamp };
    } else {
      // Target timestamp is earlier; adjust endBlock
      endBlock = midBlock - 1n;
      closestBlock = { blockNumber: midBlock, timestamp: blockTimestamp };
    }

    // Stop early if the closest block is within the time threshold
    if (Math.abs(blockTimestamp - targetTimestamp) <= timeThreshold) {
      return {
        blockNumber: Number(midBlock),
        timestamp: blockTimestamp,
        exact: false,
      };
    }
  }

  // Return the closest block found within the iteration limit
  if (closestBlock) {
    return { blockNumber: Number(closestBlock.blockNumber), timestamp: closestBlock.timestamp, exact: false };
  }

  throw new Error("No block found within the specified range and criteria");
}

function epochToTimestamps(epoch: number): {
  voteStartTs: number;
  voteEndTs: number;
  distributionEndTs: number;
  state: "not_started" | "voting" | "distribution" | "ended";
} {
  // epochs are 2 week periods starting at the unix epoch, so we take the epoch number and multiply by 2 weeks to get the start
  const voteStart = epoch * 1209600;
  const voteEnd = voteStart + 1209600 / 2;
  const distributionEnd = voteStart + 1209600;

  const now = Math.floor(Date.now() / 1000);
  let state: "not_started" | "voting" | "distribution" | "ended" = "not_started";
  if (now >= voteStart && now < voteEnd) {
    state = "voting";
  } else if (now >= voteEnd && now < distributionEnd) {
    state = "distribution";
  } else if (now >= distributionEnd) {
    state = "ended";
  }

  return {
    voteStartTs: voteStart,
    voteEndTs: voteEnd,
    distributionEndTs: distributionEnd,
    state,
  };
}

async function checkMinTs(client: PublicClient, voteStart: number, epoch: number): Promise<void> {
  const useGenesis = CONTRACTS_DEPLOYMENT_BLOCK === undefined;
  const block = await client.getBlock({ blockNumber: CONTRACTS_DEPLOYMENT_BLOCK ?? 0n });
  if (voteStart < block.timestamp) {
    throw new Error(
      `Epoch ${epoch} with vote start ${voteStart} is before ${useGenesis ? "the genesis block" : "the deployment block"}`
    );
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const epoch = query.epoch as string;

  switch (method) {
    case "GET":
      if (!epoch || isNaN(Number(epoch))) {
        res.status(400).json({ error: "Invalid epoch" });
        return;
      }

      const timestamps = epochToTimestamps(Number(epoch));

      try {
        await checkMinTs(client, timestamps.voteStartTs, Number(epoch));
      } catch (e) {
        res.status(400).json({ error: (e as { message: string }).message });
        return;
      }

      const voteStartBlock = findBlockByTimestampLimited(client, timestamps.voteStartTs);
      const voteEndBlock = findBlockByTimestampLimited(client, timestamps.voteEndTs);
      const epochEndBlock = findBlockByTimestampLimited(client, timestamps.distributionEndTs);

      const [voteStart, voteEnd, distributionEnd] = await Promise.all([voteStartBlock, voteEndBlock, epochEndBlock]);

      res.status(200).json({
        data: {
          epoch,
          state: timestamps.state,
          fetchedAt: Math.floor(Date.now() / 1000),
          epochTimestamps: {
            voteStart: timestamps.voteStartTs,
            voteEnd: timestamps.voteEndTs,
            distributionEnd: timestamps.distributionEndTs,
          },
          nearestBlocks: { iterations: 22, voteStart, voteEnd, distributionEnd },
        },
      });
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
