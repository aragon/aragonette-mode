import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { VotingEscrowAbi } from "@/artifacts/VotingEscrow.sol";
import { Address } from "viem";
import { client } from "./serverClient";

/**
 * @title Fetch the voter address from the escrow contract
 */
export async function getVotingContract(escrow: Address): Promise<Address | null> {
  try {
    return await client.readContract({
      address: escrow,
      abi: VotingEscrowAbi,
      functionName: "voter",
    });
  } catch (e) {
    console.error("Error fetching voting contract", e);
    return null;
  }
}

/**
 * @title Fetch the staking contract from the voting contract
 */
export async function getStakingContract(voting: Address): Promise<Address | null> {
  try {
    return await client.readContract({
      address: voting,
      abi: SimpleGaugeVotingAbi,
      functionName: "escrow",
    });
  } catch (e) {
    console.error("Error fetching staking contract", e);
    return null;
  }
}
