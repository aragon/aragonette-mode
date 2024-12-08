// fetch vote logs by voter, optionally by epoch and gauge

import { Address } from "viem";
import { client } from "./client";
import { optionalProperty } from "../optionalProperty";
import { flattenUnique, ResetEvent, VotedEvent } from "./parseVotes";
import { ProcessedEvent, VoteAndResetRawData, VoterData } from "./types";

export async function fetchVoterData(
  votingContract: Address,
  voter: Address,
  epoch: bigint | "all",
  gauges: Address[],
  startBlock: bigint | "latest" = 0n
) {
  const resolvedEpoch = epoch === "all" ? undefined : epoch;
  const args = {
    voter,
    ...optionalProperty("gauge", gauges),
    ...optionalProperty("epoch", resolvedEpoch),
  };

  const logs = [VotedEvent, ResetEvent].map(
    async (event) =>
      await client.getLogs({
        address: votingContract,
        fromBlock: startBlock,
        toBlock: "latest",
        args,
        event,
      })
  );
  const awaitedLogs = (await Promise.all(logs)) as unknown as VoteAndResetRawData[][];
  return awaitedLogs;
}

export function transformVoterData(voterData: VoteAndResetRawData[][], votingContract: Address): VoterData {
  const flattenedLogs = flattenUnique(voterData);
  return processSingleVoterEvents(flattenedLogs, votingContract);
}

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
