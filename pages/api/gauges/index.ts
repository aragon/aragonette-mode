import { createPublicClient, http, type Address } from "viem";
import abi from "../votes/abi/SimpleGaugeVoter";
import { fetchIpfsAsJson } from "@/utils/ipfs";
import { GaugeMetadata } from "@/plugins/voting/components/gauges-list/types";
import { NextApiRequest, NextApiResponse } from "next";
import { mode } from "viem/chains";
import { PUB_WEB3_ENDPOINT } from "@/constants";
import fs from "fs";
// import { deploymentPublicClient } from "@/scripts/lib/util/client";
const serverClient = createPublicClient({
  chain: mode,
  transport: http(PUB_WEB3_ENDPOINT, {
    batch: true,
  }),
});
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      const gauges = await getGauges(serverClient, "0x71439Ae82068E19ea90e4F506c74936aE170Cf58");
      res.status(200).json({ data: gauges });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

/**
 * @param (boolean) isActive
 * @param (bigint) createdAt
 * @param (string) ipfsURI
 * */
type GaugeDetail = [boolean, bigint, string];

/**
 * @title Fetch the list of voting gauges for the given voting contract.
 * @dev Combines onchain data with IPFS fetching via Pinata.
 * @param client - Viem client connected to the chain
 * @param votingContract - Address of the voting contract
 * @dev In the event of multiple voting contracts, we assume they are kept in sync
 * */
export async function getGauges(client: any, votingContract: Address) {
  try {
    // Get the list of gauges from the contract
    const gauges: Address[] = await client.readContract({
      address: votingContract,
      abi,
      functionName: "getAllGauges",
    });

    // multicall the contract again to fetch the onchain gauge details
    const calls = gauges.map((gauge) => ({
      abi,
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
          metadata: "Error fetching gauge",
        };
      }
    });

    // execute in parallel
    return await Promise.all(gaugePromises);
  } catch (error) {
    console.error("Error:", error);
  }
}
