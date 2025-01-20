import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { Address } from "viem";
import { GaugeDetail, GetGaugeReturn } from "./types";
import { GaugeMetadata } from "@/plugins/voting/components/gauges-list/types";
import { fetchIpfsAsJson } from "./ipfs";

/**
 * @title Fetch the list of gauges for the given voting contract.
 */
export async function getAllGauges(client: any, votingContract: Address): Promise<Address[]> {
  return await client.readContract({
    address: votingContract,
    abi: SimpleGaugeVotingAbi,
    functionName: "getAllGauges",
  });
}

/**
 * @title Fetch the list of voting gauges for the given voting contract.
 * @dev Combines onchain data with IPFS fetching via Pinata.
 * @param client - Viem client connected to the chain
 * @param votingContract - Address of the voting contract
 * @dev In the event of multiple voting contracts, we assume they are kept in sync
 */
export async function getGaugeDetails(
  client: any,
  votingContract: Address,
  gauges: Address[]
): Promise<GetGaugeReturn[]> {
  try {
    // multicall the contract again to fetch the onchain gauge details
    const calls = gauges.map((gauge) => ({
      abi: SimpleGaugeVotingAbi,
      address: votingContract,
      functionName: "gauges",
      args: [gauge],
    }));
    const multicall = await client.multicall({ contracts: calls });

    // parse the multicall data
    const gaugeDetails = multicall.map((data: any, index: number) => ({
      data: data.result,
      gauge: gauges[index],
    })) as { gauge: Address; data: GaugeDetail }[];

    // fetch the metadata from the IPFS
    const gaugePromises = gaugeDetails.map(async ({ gauge, data }) => {
      const [isActive, _, ipfsURI] = data;
      try {
        const metadata: GaugeMetadata = await fetchIpfsAsJson(ipfsURI);
        return {
          address: gauge,
          isActive: Boolean(isActive),
          ipfsURI,
          metadata,
        };
      } catch (e) {
        console.warn("Error fetching gauge", gauge, (e as any).message);
        return {
          address: gauge,
          isActive: Boolean(isActive),
          ipfsURI,
          metadata: "Error fetching gauge details from IPFS",
        };
      }
    });

    // execute in parallel
    return await Promise.all(gaugePromises);
  } catch (error) {
    console.error("Error:", error);
    return [] as GetGaugeReturn[];
  }
}
