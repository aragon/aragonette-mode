import { type Address } from "viem";

export type RewardItemMetadata = {
  name: string;
  logo: string;
  address: Address;
  symbol: string;
};

export type RewardClaimedEvent = {
  identifier: string;
  token: Address;
  account: Address;
  amount: string;
};
