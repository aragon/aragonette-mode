import { Address } from "viem";
import { client } from "./client";
import { optionalProperty } from "../optionalProperty";
import { flattenUnique, ResetEvent, VotedEvent } from "./parseVotes";
import { ProcessedEvent, VoteAndResetRawData, VoterData } from "./types";

/**
 * @title Fetches the logs for a voter from the voting contract.
 * @param votingContract - Address of the voting contract
 * @param voter - Address of the voter - note that if reset was called via the staking contract, the voter will be the staking contract
 * @param epoch - Epoch to filter logs by, or "all" for all epochs
 * @param gauges - Array of gauge addresses to filter logs by
 * @param stakingContract - Address of the staking contract - we also need to grab reset logs from here
 * @param startBlock - Block number to start fetching logs from
 */
export async function fetchVoterData(
  votingContract: Address,
  voter: Address,
  epoch: string | "all",
  gauges: Address[],
  stakingContract: Address,
  startBlock: bigint | "latest" = 0n
) {
  // optionally add the epoch if it's provided
  const resolvedEpoch = epoch === "all" ? undefined : BigInt(epoch);
  const args = {
    voter,
    ...optionalProperty("gauge", gauges),
    ...optionalProperty("epoch", resolvedEpoch),
  };

  // Fetch the voted logs only
  // In current implementation we can assume the token id stays the same for a given voter
  const votedLogs = client.getLogs({
    address: votingContract,
    fromBlock: startBlock,
    toBlock: "latest",
    args,
    event: VotedEvent,
  });

  // Add the staking contract to the voter args in the case of a reset log
  // This is because the voter will be the staking contract in this case
  // and we don't yet have a good way to grab the originating address
  const newArgs = {
    ...args,
    voter: [args.voter, stakingContract],
  };

  // Fetch the reset logs
  const resetLogs = client.getLogs({
    address: votingContract,
    fromBlock: startBlock,
    toBlock: "latest",
    args: newArgs,
    event: ResetEvent,
  });

  const awaitedLogs = await Promise.all([votedLogs, resetLogs]);
  return awaitedLogs as unknown as VoteAndResetRawData[][];
}

export function transformVoterData(voterData: VoteAndResetRawData[][], votingContract: Address): VoterData {
  const flattenedLogs = flattenUnique(voterData, true);
  return processSingleVoterEvents(flattenedLogs, votingContract);
}

/**
 * @title Processes the logs for a single voter and returns the voter data with token and transaction information
 * @param events - Array of processed events for a single voter
 * @param votingContract - Address of the voting contract
 */
export function processSingleVoterEvents(events: ProcessedEvent[], votingContract: Address): VoterData {
  if (events.length === 0) {
    return {} as VoterData;
  }

  // Extract the voter from the first event
  const voterAddress = events[0].voter;

  // Check for multiple voters
  for (const event of events) {
    if (event.voter !== voterAddress) {
      throw new Error("Multiple voters found in the event logs.");
    }
  }

  // Initialize the voter data
  const voterData: VoterData = {
    address: voterAddress,
    votingContract,
    gaugeVotes: [],
  };

  // Process the events
  for (const event of events) {
    const gaugeAddress = event.gauge;

    // Find or create the gauge data
    let gaugeData = voterData.gaugeVotes.find((gv) => gv.gauge === gaugeAddress);
    if (!gaugeData) {
      gaugeData = { gauge: gaugeAddress, totalVotes: "0", latestVotes: [] };
      voterData.gaugeVotes.push(gaugeData);
    }

    // Add the vote data
    gaugeData.latestVotes.push({
      tokenId: event.tokenId.toString(),
      votes: event.votes.toString(),
      timestamp: event.timestamp,
      logIndex: event.logIndex,
      epoch: event.epoch.toString(),
      transactionHash: event.transactionHash,
      blockNumber: parseInt(event.blockNumber, 10),
    });

    // Update the total votes for the gauge
    gaugeData.totalVotes = gaugeData.latestVotes.reduce((sum, vote) => sum + BigInt(vote.votes), BigInt(0)).toString();
  }

  return voterData;
}
