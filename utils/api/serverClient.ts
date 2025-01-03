import { PUB_CHAIN } from "@/constants";
import { createPublicClient, http } from "viem";

/**
 * @title Instantiates a public client for the PUB_CHAIN
 */
export const client = createPublicClient({
  transport: http(),
  chain: PUB_CHAIN,
});
