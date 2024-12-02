import { NextApiRequest, NextApiResponse } from "next";
import { getGauges } from "./app/getGauges";
import { Address, createPublicClient, getAbiItem, GetLogsReturnType, http } from "viem";
import { mode } from "viem/chains";
import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import fs from "fs";
import { client } from "../_client";
import { GaugeMetadata } from "@/plugins/voting/components/gauges-list/types";
import { GetGaugeReturn } from "../v1/gauges";

const VotedEvent = getAbiItem({
  abi: SimpleGaugeVotingAbi,
  name: "Voted",
});

const ResetEvent = getAbiItem({
  abi: SimpleGaugeVotingAbi,
  name: "Reset",
});

type TopLevelVoteData = {
  // total votes cast across all gauges
  totalVotes: bigint;
  gauges: {
    // address of a given gauge
    address: Address;
    metadata: {
      // name of the gauge
      name: string;
      // description of the gauge
      description: string;
    };
    // votes the gauge received
    votes: bigint;
    // number of veNFTs that cast at least 1 unit of voting power for the gauge
    voteCount: number;
  };
};

type NFTGaugeVoteData = {
  // token Id of the veNFT that voted
  id: bigint;
  // most recent votes cast for the gauge, zero if reset
  votes: bigint;
  // last update seen for votes (or reset)
  votedAt: Date;
  // address of the underlying staking token for the veNFT
  underlying: Address;
  // was the last event a reset event

  // TODO: if we allow resets in the distribution window, we will need to amend this somehow
};

type GaugeVoteData = {
  gauge: {
    // the name of the gauge, fetched from metadata
    name: string;
    // the address of the gauge
    address: Address;
  };
  // total votes for the gauge
  totalVotes: bigint;
  nfts: NFTGaugeVoteData[];
};

type GroupedGaugeVoteData = {
  [voter: Address]: GaugeVoteData[];
};

type VoteData = {
  // the epoch id under which votes are grouped
  [epoch: number]: TopLevelVoteData[];
  // The account that cast the vote
  [voter: Address]: {
    votes: GaugeVoteData[];
  };
};

type BaseEvent = {
  address: string;
  blockHash: string;
  blockNumber: string;
  data: string;
  logIndex: number;
  removed: boolean;
  topics: [string, string, string, string];
  transactionHash: string;
  transactionIndex: number;
};

type ResetArgs = {
  voter: string;
  gauge: string;
  epoch: string;
  tokenId: string;
  votingPowerRemovedFromGauge: string;
  totalVotingPowerInGauge: string;
  totalVotingPowerInContract: string;
  timestamp: string;
};

type VotedArgs = {
  voter: string;
  gauge: string;
  epoch: string;
  tokenId: string;
  votingPowerCastForGauge: string;
  totalVotingPowerInGauge: string;
  totalVotingPowerInContract: string;
  timestamp: string;
};

export type VoteAndResetRawData =
  | (BaseEvent & { eventName: "Reset"; args: ResetArgs })
  | (BaseEvent & { eventName: "Voted"; args: VotedArgs });

export type HiddenHandSummary = {
  gauge: Address;
  title: string;
  totalVotes: bigint;
  votes: {
    voter: Address;
    votes: bigint;
  }[];
};

/// @notice Grabs the raw vote and reset logs for all the passed voting contracts and given epoch
export async function fetchVoteAndResetData(contracts: Address[], epoch: bigint): Promise<VoteAndResetRawData[][]> {
  const promisesVoted = contracts.map(
    async (contract) =>
      await client.getLogs({
        address: contract,
        event: VotedEvent,
        args: { epoch },
        fromBlock: BigInt(0),
        toBlock: "latest",
      })
  );
  const promisesReset = contracts.map(
    async (contract) =>
      await client.getLogs({
        address: contract,
        event: ResetEvent,
        args: { epoch },
        fromBlock: BigInt(0),
        toBlock: "latest",
      })
  );

  return (await Promise.all([...promisesVoted, ...promisesReset])) as unknown as VoteAndResetRawData[][];
}
type ProcessedEvent = {
  tokenId: bigint;
  voter: Address;
  gauge: Address;
  epoch: bigint;
  votes: bigint;
  timestamp: string;
  eventName: "Reset" | "Voted";
  votingContract: Address;
};

/// @notice Prunes duplicate vote data, preserving only the most recent item
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
      timestamp: String(event.args.timestamp),
      votes: BigInt(votes ?? 0),
      eventName: event.eventName,
      votingContract: event.address as Address,
    };
  });

  // Step 3: Filter for latest unique events
  const latestEvents = new Map<string, ProcessedEvent>();

  for (const event of processed) {
    const key = `${event.tokenId}-${event.votingContract}-${event.gauge}`; // Unique key per tokenId and address and gauge
    const existing = latestEvents.get(key);

    // If no existing event or this event is newer, update the map
    if (!existing || Number(event.timestamp) > Number(existing.timestamp)) {
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

export function groupEventsByVoter(events: ProcessedEvent[]): Record<string, ProcessedEvent[]> {
  // Create an object to hold the groups
  const groupedByVoter: Record<string, ProcessedEvent[]> = {};

  for (const event of events) {
    const voter = event.voter;

    // If the voter doesn't exist in the group, initialize an array
    if (!groupedByVoter[voter]) {
      groupedByVoter[voter] = [];
    }

    // Push the current event to the voter's group
    groupedByVoter[voter].push(event);
  }

  return groupedByVoter;
}

export function groupEventsByVoterAndGauge(events: ProcessedEvent[]): Record<string, Record<string, ProcessedEvent[]>> {
  const groupedByVoter: Record<string, Record<string, ProcessedEvent[]>> = {};

  for (const event of events) {
    const { voter, gauge } = event;

    // Ensure voter exists
    if (!groupedByVoter[voter]) {
      groupedByVoter[voter] = {};
    }

    // Ensure gauge exists for this voter
    if (!groupedByVoter[voter][gauge]) {
      groupedByVoter[voter][gauge] = [];
    }

    // Add event to the correct gauge for the voter
    groupedByVoter[voter][gauge].push(event);
  }

  return groupedByVoter;
}

export function transformProcessedDataToGaugeVoteData(processedData: ProcessedEvent[]): GroupedGaugeVoteData {
  const groupedData: GroupedGaugeVoteData = {};

  for (const event of processedData) {
    const voter = event.voter as Address;
    const gaugeAddress = event.gauge as Address;
    const votes = BigInt(event.votes || 0); // Use event.votes directly
    const votedAt = new Date(Number(event.timestamp) * 1000);

    // Prepare NFTVoteData
    const nftVoteData: NFTGaugeVoteData = {
      id: BigInt(event.tokenId),
      votes,
      votedAt,
      underlying: gaugeAddress,
    };

    // Initialize voter entry if it doesn't exist
    if (!groupedData[voter]) {
      groupedData[voter] = [];
    }

    // Check if this gauge already exists in the voter's data
    let gaugeData = groupedData[voter].find((g) => g.gauge.address === gaugeAddress);

    if (!gaugeData) {
      // Create a new GaugeVoteData entry if not found
      gaugeData = {
        gauge: {
          name: "example name", // Placeholder for gauge name
          address: gaugeAddress,
        },
        totalVotes: BigInt(0),
        nfts: [],
      };
      groupedData[voter].push(gaugeData);
    }

    // Add the NFTVoteData to the gauge and update totalVotes
    gaugeData.nfts.push(nftVoteData);
    gaugeData.totalVotes += votes;
  }

  return groupedData;
}

export function createHiddenHandSummary(
  processedData: ProcessedEvent[],
  gauges: GetGaugeReturn[]
): HiddenHandSummary[] {
  const gaugeMap: Map<Address, HiddenHandSummary> = new Map();

  for (const event of processedData) {
    const gaugeAddress = event.gauge as Address;
    const voterAddress = event.voter as Address;
    const votes = BigInt(event.votes || 0);

    // Initialize the gauge entry if it doesn't exist
    if (!gaugeMap.has(gaugeAddress)) {
      gaugeMap.set(gaugeAddress, {
        gauge: gaugeAddress,
        title: "No title found", // Placeholder title
        totalVotes: BigInt(0),
        votes: [],
      });
    }

    const gaugeSummary = gaugeMap.get(gaugeAddress)!;

    // Update the total votes for the gauge
    gaugeSummary.totalVotes += votes;

    // Check if the voter already exists in the votes array
    const voterEntry = gaugeSummary.votes.find((v) => v.voter === voterAddress);

    if (voterEntry) {
      // Add to existing voter's votes
      voterEntry.votes += votes;
    } else {
      // Add a new voter entry
      gaugeSummary.votes.push({
        voter: voterAddress,
        votes: votes,
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
