import { AbiEvent, Address, getAbiItem, GetLogsReturnType } from "viem";
import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { client } from "./client";
import { GaugeVoteSummary, GetGaugeReturn, ProcessedEvent, VoteAndResetRawData } from "./types";
import { optionalProperty } from "../optionalProperty";

export const ALCHEMY_MAX_LOGS = 10_000;

export const VotedEvent = getAbiItem({
  abi: SimpleGaugeVotingAbi,
  name: "Voted",
});

export const ResetEvent = getAbiItem({
  abi: SimpleGaugeVotingAbi,
  name: "Reset",
});

/**
 * @title Iterates through logs in batches of ALCHEMY_MAX_LOGS to ensure we get all logs
 * @param contract - Address of the voting contract
 * @param startBlock - Block number to start fetching logs from
 * @param gauges - Array of gauge addresses to filter logs by
 * @param event - AbiEvent to filter logs by (Voted or Reset)
 * @param epoch - Optional epoch to filter logs by - if passed will only fetch logs for that epoch, else it will be all epochs
 */
export async function paginateLogs(
  contract: Address,
  startBlock: bigint,
  gauges: Address[],
  event: AbiEvent,
  epoch?: bigint
) {
  // conditionally add the epoch if it's provided
  const args = {
    gauge: gauges,
    ...optionalProperty("epoch", epoch),
  };

  // fetch the initial set of logs
  let logs = await client.getLogs({
    address: contract,
    fromBlock: startBlock,
    toBlock: "latest",
    args,
    event,
  });

  // if logs are 10k, we need to paginate by starting at the last block of the previous batch
  let lastBatchLength = logs.length;
  while (lastBatchLength === ALCHEMY_MAX_LOGS) {
    const lastLog = logs[logs.length - 1];
    const lastBlock = lastLog.blockNumber;
    const newLogs = await client.getLogs({
      address: contract,
      fromBlock: lastBlock,
      toBlock: "latest",
      args,
      event: VotedEvent,
    });
    logs = logs.concat(newLogs);
    lastBatchLength = newLogs.length;
  }

  const uniqueLogs = removeDuplicateLogs(logs);
  return uniqueLogs;
}

/**
 * @title When fetching logs at the limit, we might get duplicates if the latest block has multiple logs.
 * This function removes duplicates based on the transaction hash and log index.
 * @param logs - Array of logs to remove duplicates from
 */
export function removeDuplicateLogs(logs: GetLogsReturnType): GetLogsReturnType {
  const logMap = new Map();
  logs.forEach((log) => {
    const uniqueKey = `${log.transactionHash}_${log.logIndex}`;
    logMap.set(uniqueKey, log);
  });
  return Array.from(logMap.values());
}

/**
 * @title Grabs the raw vote and reset logs for a given set of contracts and gauges and processes to a common format
 * @param contract - Address of the voting contracts
 * @param gauges - Array of gauge addresses to filter logs by
 * @param epoch - Optional epoch to filter logs by - if passed will only fetch logs for that epoch, else it will be all epochs
 * @param fromBlock - Optional block number to start fetching logs from
 */
export async function fetchVoteAndResetData(
  contract: Address,
  gauges: Address[],
  epoch?: bigint,
  fromBlock = 0n
): Promise<ProcessedEvent[]> {
  const promiseLogs = [VotedEvent, ResetEvent].map(
    async (event) => await paginateLogs(contract, fromBlock, gauges, event, epoch)
  );

  const logs = (await Promise.all(promiseLogs)) as unknown as VoteAndResetRawData[][];
  return flattenUnique(logs);
}

/**
 * @title Flattens the array of raw logs and extracts relevant fields
 * @param events - Array of raw logs to flatten
 */
export function flattenUnique(events: VoteAndResetRawData[][]): ProcessedEvent[] {
  // Step 1: Flatten the array
  const flattened = events.flat();

  // Step 2: Extract relevant fields
  const processed = flattened.map((event) => {
    const votes = "votingPowerCastForGauge" in event.args ? event.args.votingPowerCastForGauge : 0; // reset
    return {
      tokenId: BigInt(event.args?.tokenId ?? 0),
      voter: event.args.voter as Address,
      gauge: event.args.gauge as Address,
      epoch: BigInt(event.args?.epoch ?? 0),
      logIndex: event.logIndex,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: String(event.args.timestamp),
      votes: BigInt(votes ?? 0),
      eventName: event.eventName,
      votingContract: event.address as Address,
    };
  });

  // Step 3: Filter for latest unique events
  const latestEvents = new Map<string, ProcessedEvent>();

  // you can have multiple logs for a given tokenId, gauge, and voting contract and timestamp
  // the log index then should be the determinant
  for (const event of processed) {
    const key = `${event.tokenId}-${event.votingContract}-${event.gauge}`; // Unique key per tokenId and address and gauge
    const existing = latestEvents.get(key);

    // if we dont have an existing event, add it
    if (!existing) latestEvents.set(key, event);
    // if the timestamp is greater, use the latest ts
    else if (Number(event.timestamp) > Number(existing.timestamp)) {
      latestEvents.set(key, event);
    }
    // if the timestamp is the same, use the latest log index
    else if (Number(event.timestamp) === Number(existing.timestamp) && event.logIndex > existing.logIndex) {
      latestEvents.set(key, event);
    }
  }

  // Step 4: filter out where the last event is a reset
  // do this after checking for latest to ensure that if someone has reset, we don't count their votes
  for (const event of processed) {
    const key = `${event.tokenId}-${event.votingContract}-${event.gauge}`;
    const existing = latestEvents.get(key);

    if (existing && existing.eventName === "Reset") {
      latestEvents.delete(key);
    }
  }

  // Convert the map values to an array
  return Array.from(latestEvents.values());
}

/**
 * @title Summarizes the votes by gauge and voter
 * @param processedData - Array of processed events
 * @param gauges - Array of gauge details
 * @param votingContract - Address of the voting contract
 * @param epoch - Optional epoch to filter logs by - if passed will only fetch logs for that epoch, else it will be all epochs
 */
export function summarizeVotesByGauge(
  processedData: ProcessedEvent[],
  gauges: GetGaugeReturn[],
  votingContract: Address,
  epoch?: string
): GaugeVoteSummary[] {
  const gaugeMap: Map<Address, GaugeVoteSummary> = new Map();

  for (const event of processedData) {
    const gaugeAddress = event.gauge as Address;
    const voterAddress = event.voter as Address;
    const votes = BigInt(event.votes || 0);

    // Initialize the gauge entry if it doesn't exist
    if (!gaugeMap.has(gaugeAddress)) {
      gaugeMap.set(gaugeAddress, {
        gauge: gaugeAddress,
        votingContract,
        epoch: epoch ?? "all",
        title: "No title found", // Placeholder title
        totalVotes: "0",
        votes: [],
      });
    }

    const gaugeSummary = gaugeMap.get(gaugeAddress)!;

    // Update the total votes for the gauge
    gaugeSummary.totalVotes = String(BigInt(gaugeSummary.totalVotes) + votes);

    // Check if the voter already exists in the votes array
    const voterEntry = gaugeSummary.votes.find((v) => v.voter === voterAddress);

    if (voterEntry) {
      // Add to existing voter's votes
      voterEntry.votes = String(BigInt(voterEntry.votes) + votes);
    } else {
      // Add a new voter entry
      gaugeSummary.votes.push({
        voter: voterAddress,
        votes: votes.toString(),
      });
    }
  }

  // update the gauge title
  for (const gauge of gauges) {
    const gaugeSummary = gaugeMap.get(gauge.address);

    if (gaugeSummary) {
      // this will be the error title
      if (typeof gauge.metadata === "string") {
        continue;
      } else {
        gaugeSummary.title = gauge.metadata.name;
      }
    }
  }

  // Convert the map values to an array
  return Array.from(gaugeMap.values());
}
