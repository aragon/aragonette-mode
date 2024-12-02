import { type Address } from "viem";
import Bottleneck from "bottleneck";
import { fetchIpfsAsJson } from "./ipfs";
import type { GaugeInfo } from "./types";
import abi from "../abi/SimpleGaugeVoter";

export async function getGauges(client: any, skipFetch: boolean, voterAddress: Address) {
  try {
    // Get the list of gauges from the contract

    const gauges: Address[] = (await client.readContract({
      address: voterAddress,
      abi,
      functionName: "getAllGauges",
    })) as Address[];

    const limiter = new Bottleneck({
      minTime: 500,
    });

    console.timeEnd("readContract");

    console.time(`gauge-rpc`);
    const contract = {
      address: voterAddress,
      abi,
    } as const;

    const calls = gauges.map((gauge) => ({
      ...contract,
      functionName: "gauges",
      args: [gauge],
    }));

    const multicall = await client.multicall({ contracts: calls });
    //
    const gaugeDetails = multicall.map((data: any, index: number) => ({
      data: data.result,
      gauge: gauges[index],
    }));
    console.timeEnd(`gauge-rpc`);

    const gaugePromises = gaugeDetails.map(async ({ gauge, data }) => {
      // Extract the IPFS URI
      const ipfsURI = data[2];
      try {
        // Fetch the metadata from IPFS
        console.time(`gauge-${gauge} ipfs`);
        const metadata = await fetchIpfsAsJson(ipfsURI);

        console.timeEnd(`gauge-${gauge} ipfs`);
        // Create the GaugeInfo object
        return {
          address: gauge,
          ipfsURI: ipfsURI,
          metadata: metadata,
        } as GaugeInfo;
      } catch {
        console.log("Error fetching gauge", gauge);
        return {
          address: gauge,
          ipfsURI: ipfsURI,
          metadata: "Error fetching gauge",
        };
      }
    });

    // Execute all promises in parallel
    // const gaugeInfos = await limiter.schedule(() => Promise.all(gaugePromises));
    const gaugeInfos = await Promise.all(gaugePromises);

    // Write the data to 'gauges.json'
    // fs.writeFileSync(gaugesFilePath, JSON.stringify(gaugeInfos, null, 2));
    // console.log(JSON.stringify(gaugeInfos, null, 2));
    // return in format {gauge: Address, title: string }
    const result = gaugeInfos.map((gauge) => {
      return { gauge: gauge.address, title: gauge.metadata.name };
    });
    console.log(result);
    return result;

    // Output the JSON blob
  } catch (error) {
    console.error("Error:", error);
  }
  console.timeEnd("getGauges");
}
