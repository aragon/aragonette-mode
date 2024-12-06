import { VotingEscrowAbi } from "@/artifacts/VotingEscrow.sol";
import { PUB_CHAIN } from "@/constants";
import { Address, createPublicClient, http } from "viem";

/**
 * @title Instantiates a public client for the PUB_CHAIN
 */
export const client = createPublicClient({
  transport: http(),
  chain: PUB_CHAIN,
});

/**
 * @title Fetch the voter address from the escrow contract
 */
export async function getVoter(escrow: Address): Promise<Address> {
  return await client.readContract({
    address: escrow,
    abi: VotingEscrowAbi,
    functionName: "voter",
  });
}
