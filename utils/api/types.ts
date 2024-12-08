import { GaugeMetadata } from "@/plugins/voting/components/gauges-list/types";
import { Address } from "viem";

export interface Resource {
  field: string;
  value: string;
  url: string;
}

export interface Metadata {
  name: string;
  description: string;
  logo: string;
  resources: Resource[];
}

export interface GaugeInfo {
  address: string; // Address of the gauge
  metadata: Metadata;
  ipfsURI: string;
}

export interface GaugeVoteInfo {
  gaugeAddress: string;
  name: string;
  votes: string;
  votesBigInt?: bigint;
  percentage: string;
}

export interface GaugeVotesBlob {
  contract: string;
  timestamp: string;
  totalVotes: string;
  aggregatePercentage: string;
  gauges: GaugeVoteInfo[];
}

/**
 * Tuple output from fetching onchain gauge
 * @param (boolean) isActive
 * @param (bigint) createdAt
 * @param (string) ipfsURI
 * */
export type GaugeDetail = [boolean, bigint, string];

export type GetGaugeReturn = {
  address: Address;
  ipfsURI: string;
  metadata: GaugeMetadata | string;
};

export type ProcessedEvent = {
  tokenId: bigint;
  voter: Address;
  gauge: Address;
  logIndex: number;
  blockNumber: string;
  transactionHash: string;
  epoch: bigint;
  votes: bigint;
  timestamp: string;
  eventName: "Reset" | "Voted";
  votingContract: Address;
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

export type GaugeVoteSummary = {
  gauge: Address;
  votingContract: Address;
  epoch: string | "all";
  title: string;
  totalVotes: string;
  votes: {
    voter: Address;
    votes: string;
  }[];
};

export type VoterData = {
  address: Address;
  votingContract: Address;
  gaugeVotes: {
    gauge: Address;
    totalVotes: string;
    latestVotes: {
      tokenId: string;
      epoch: string;
      votes: string;
      timestamp: string;
      logIndex: number;
      transactionHash: string;
      blockNumber: number;
    }[];
  }[];
};
