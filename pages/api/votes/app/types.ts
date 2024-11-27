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
