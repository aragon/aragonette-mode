import { type Address } from "viem";
import { fetchIpfsAsJson } from "@/utils/ipfs";
import { GaugeMetadata } from "@/plugins/voting/components/gauges-list/types";
import { NextApiRequest, NextApiResponse } from "next";
import { MODE_ESCROW_CONTRACT } from "@/constants";
import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import { client, getVoter } from "../../_client";
import { GaugeDetail } from "../../votes/app/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      const voter = await getVoter(MODE_ESCROW_CONTRACT);
      const gauges = await getGauges(client, voter);
      res.status(200).json({ data: gauges });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export type GetGaugeReturn = {
  address: Address;
  ipfsURI: string;
  metadata: GaugeMetadata | string;
};

/**
 * @title Fetch the list of voting gauges for the given voting contract.
 * @dev Combines onchain data with IPFS fetching via Pinata.
 * @param client - Viem client connected to the chain
 * @param votingContract - Address of the voting contract
 * @dev In the event of multiple voting contracts, we assume they are kept in sync
 * */
export async function getGauges(client: any, votingContract: Address): Promise<GetGaugeReturn[]> {
  try {
    // Get the list of gauges from the contract
    const gauges: Address[] = await client.readContract({
      address: votingContract,
      abi: SimpleGaugeVotingAbi,
      functionName: "getAllGauges",
    });

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
      const ipfsURI = data[2];
      try {
        const metadata: GaugeMetadata = await fetchIpfsAsJson(ipfsURI);
        return {
          address: gauge,
          ipfsURI: ipfsURI,
          metadata,
        };
      } catch {
        console.log("Error fetching gauge", gauge);
        return {
          address: gauge,
          ipfsURI: ipfsURI,
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
