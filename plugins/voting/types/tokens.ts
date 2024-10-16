import { type Address } from "viem";

export enum Token {
  MODE,
  BPT,
}

export type Gauge = {
  gauge: Address;
  weight: bigint;
};

export enum Contract {
  ESCROW_CONTRACT,
  TOKEN_CONTRACT,
  VOTER_CONTRACT,
  CURVE_CONTRACT,
  CLOCK_CONTRACT,
  EXIT_QUEUE_CONTRACT,
}
