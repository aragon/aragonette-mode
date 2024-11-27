import fs from "fs";
import path from "path";
import type { GaugeVoteInfo, GaugeVotesBlob } from "./types";
import { calculatePercentage } from "./getVotes";
// Function to read gauge votes from files
function readGaugeVotesFiles(contractAddresses: string[]): GaugeVotesBlob[] {
  const blobs: GaugeVotesBlob[] = [];
  for (const contractAddress of contractAddresses) {
    const filename = `gaugeVotes-${contractAddress}.json`;
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }
    const data = fs.readFileSync(filePath, "utf8");
    const blob: GaugeVotesBlob = JSON.parse(data);
    blobs.push(blob);
  }
  return blobs;
}

// Main function
export function aggreagateVotes(contractAddresses: [string, string]) {
  try {
    // Array of contract addresses
    const gaugeVoteBlobs = readGaugeVotesFiles(contractAddresses);

    // Store all gauge addresses and check for mismatches
    const allGaugeAddresses = new Set<string>();
    const gaugesPerBlob = gaugeVoteBlobs.map((blob) => {
      const gaugeAddresses = new Set<string>();
      for (const gauge of blob.gauges) {
        gaugeAddresses.add(gauge.gaugeAddress);
        allGaugeAddresses.add(gauge.gaugeAddress);
      }
      return gaugeAddresses;
    });

    // Check that all blobs have the same gauges
    for (const gaugeAddresses of gaugesPerBlob) {
      if (
        gaugeAddresses.size !== allGaugeAddresses.size ||
        [...allGaugeAddresses].some((addr) => !gaugeAddresses.has(addr))
      ) {
        throw new Error("Gauge addresses mismatch between files");
      }
    }

    // Pair the gauges and combine votes
    const combinedGaugesMap = new Map<string, GaugeVoteInfo>();

    for (const gaugeAddress of allGaugeAddresses) {
      let totalVotesBigInt = BigInt(0);
      let name = "";
      for (const blob of gaugeVoteBlobs) {
        const gaugeInfo = blob.gauges.find((g) => g.gaugeAddress === gaugeAddress);
        if (gaugeInfo) {
          const votesBigInt = BigInt(gaugeInfo.votes);
          totalVotesBigInt += votesBigInt;
          name = gaugeInfo.name; // Assuming name is consistent across blobs
        } else {
          throw new Error(`Gauge ${gaugeAddress} not found in one of the blobs`);
        }
      }
      combinedGaugesMap.set(gaugeAddress, {
        gaugeAddress,
        name,
        votes: totalVotesBigInt.toString(),
        votesBigInt: totalVotesBigInt,
      } as any);
    }

    // Compute total votes
    let totalVotes = BigInt(0);
    for (const gauge of combinedGaugesMap.values()) {
      totalVotes += gauge.votesBigInt!;
    }

    // Compute percentages for each gauge
    const combinedGauges: GaugeVoteInfo[] = [];
    for (const gauge of combinedGaugesMap.values()) {
      const percentage = calculatePercentage(gauge.votesBigInt!, totalVotes);
      combinedGauges.push({
        gaugeAddress: gauge.gaugeAddress,
        name: gauge.name,
        votes: gauge.votes,
        percentage: percentage.toFixed(4) + "%",
      });
    }
    // Compute aggregate percentage
    const aggregatePercentage = combinedGauges.reduce((sum, gauge) => {
      return sum + parseFloat(gauge.percentage!);
    }, 0);

    // Create the final combined blob
    const combinedBlob: GaugeVotesBlob = {
      contract: "Combined Contracts",
      timestamp: new Date().toISOString(),
      totalVotes: totalVotes.toString(),
      aggregatePercentage: aggregatePercentage.toFixed(4) + "%",
      gauges: combinedGauges,
    };

    // Write the combined data to a new JSON file
    fs.writeFileSync("combinedGaugeVotes.json", JSON.stringify(combinedBlob, null, 2));
    console.log("Combined gauge votes data has been written to 'combinedGaugeVotes.json'");
  } catch (error) {
    console.error("Error combining gauge votes:", error);
  }
}
