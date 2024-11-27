import fs from "fs";
import path from "path";
import type { GaugeInfo, GaugeVoteInfo, GaugeVotesBlob } from "./types";
import abi from "../abi/SimpleGaugeVoter";

export async function getVotes(client: any, voterContract: string) {
  try {
    // Define the path for 'gauges.json'
    const gaugesFilePath = path.join(process.cwd(), "gauges.json");

    // Check if 'gauges.json' exists
    if (!fs.existsSync(gaugesFilePath)) {
      console.error("Gauges file not found. Please run getGauges first to generate 'gauges.json'.");
      return;
    }

    // Read the gauges data from 'gauges.json'
    const data = fs.readFileSync(gaugesFilePath, "utf8");
    const gaugeInfos: GaugeInfo[] = JSON.parse(data);

    // Fetch votes for each gauge using Promise.all
    const gaugeVotesPromises = gaugeInfos.map(async (gaugeInfo) => {
      const { address: gaugeAddress, metadata } = gaugeInfo;

      // Call the 'gaugeVotes' function on the contract
      const votes = (await client.readContract({
        address: voterContract,
        abi: abi,
        functionName: "gaugeVotes",
        args: [gaugeAddress],
      })) as bigint;

      return {
        gaugeAddress,
        name: metadata.name,
        votes: votes.toString(),
        votesBigInt: votes, // Keep votes as BigInt for calculations
      } as GaugeVoteInfo;
    });

    const gaugesWithVotes: GaugeVoteInfo[] = await Promise.all(gaugeVotesPromises);

    // Compute total votes as BigInt
    const totalVotes = gaugesWithVotes.reduce((sum, gauge) => {
      return sum + gauge.votesBigInt!;
    }, BigInt(0));

    // Compute percentage for each gauge and include it
    const gaugesWithVotesAndPercentage = gaugesWithVotes.map((gauge) => {
      const percentage = calculatePercentage(gauge.votesBigInt!, totalVotes);
      return {
        gaugeAddress: gauge.gaugeAddress,
        name: gauge.name,
        votes: gauge.votes,
        percentage, // percentage as number
      };
    });

    // Compute aggregate percentage
    const aggregatePercentage = gaugesWithVotesAndPercentage.reduce((sum, gauge) => {
      return sum + gauge.percentage;
    }, 0);

    // Create the final JSON blob
    const result: GaugeVotesBlob = {
      contract: voterContract,
      timestamp: new Date().toISOString(),
      totalVotes: totalVotes.toString(),
      aggregatePercentage: aggregatePercentage.toFixed(4) + "%",
      gauges: gaugesWithVotesAndPercentage.map((gauge) => ({
        ...gauge,
        percentage: gauge.percentage.toFixed(4) + "%",
      })),
    };

    const file = `gaugeVotes-${voterContract}.json`;

    // Write the result to 'gaugeVotes.json'
    fs.writeFileSync(file, JSON.stringify(result, null, 2));
    console.log(`Gauge votes data has been written to ${file}`);
  } catch (error) {
    console.error("Error fetching votes:", error);
  }
}

// Helper function to calculate percentage as a number
export function calculatePercentage(votes: bigint, totalVotes: bigint): number {
  if (totalVotes === BigInt(0)) {
    return 0;
  }
  const percentage = (Number(votes) / Number(totalVotes)) * 100;
  return percentage;
}
