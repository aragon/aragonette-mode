import { VotingEscrowAbi } from "@/artifacts/VotingEscrow.sol";
import { PUB_CHAIN } from "@/constants";
import { Address, createPublicClient, http, PublicClient } from "viem";

export const client = createPublicClient({
  transport: http(),
  chain: PUB_CHAIN,
});

export async function getVoter(escrow: Address): Promise<Address> {
  return await client.readContract({
    address: escrow,
    abi: VotingEscrowAbi,
    functionName: "voter",
  });
}
