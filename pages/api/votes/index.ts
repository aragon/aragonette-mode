import { NextApiRequest, NextApiResponse } from "next";
import { getGauges } from "./app/getGauges";
import { Address, createPublicClient, getAbiItem, http } from "viem";
import { mode } from "viem/chains";
import { SimpleGaugeVotingAbi } from "@/artifacts/SimpleGaugeVoting.sol";
import fs from "fs";
import { fetchVoteAndResetData } from "./data";

/**
  * 
  
  "it would be best to have a way of knowing how many votes are 
cast for the given pool for this round so far,
  by what wallet (and how much by it respectivelly) and the    
pools name (so we can show it on the UI in a readable way).
  this should be query-able whenever the UI loads up so we 
can have fresh information"

  **/

// endpoints we want:
// 1. Get votes by gauge, allow for filtering by epoch
// 2. Get votes by gauge, by address, including % of total votes, allow for filtering by epoch
// 3. Get votes by gauge, by tokenId, including % of total votes, allow for filtering by epoch

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      await get();
      res.status(200).json({ message: "Get users" });
      break;
    case "POST":
      await post();
      res.status(200).json({ message: "Post users" });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
const VotedEvent = getAbiItem({
  abi: SimpleGaugeVotingAbi,
  name: "Voted",
});
//
// hacking on HTTP for now we just need the raw data
async function post() {
  const contractAddress = "0x71439Ae82068E19ea90e4F506c74936aE170Cf58";
  // 3. Extract a Viem Client for the current active chain.
  const publicClient = createPublicClient({
    chain: mode,
    transport: http("https://mainnet.mode.network/"),
  });

  const logs = await publicClient.getLogs({
    address: contractAddress,
    event: VotedEvent,
    // args: { gauge, epoch },
    fromBlock: BigInt(0),
    toBlock: "latest",
  });

  logs.sort((a, b) => {
    return Number(b.blockNumber - a.blockNumber);
  });
  const serialized = JSON.stringify(logs, (key, value) => (typeof value === "bigint" ? value.toString() : value), 2);

  const newLogs = await fetchVoteAndResetData(
    [contractAddress, "0x2aA8A5C1Af4EA11A1f1F10f3b73cfB30419F77Fb"],
    BigInt(1431)
  );

  const serialized2 = JSON.stringify(
    newLogs,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2
  );

  fs.writeFileSync("logs.json", serialized);
  fs.writeFileSync("newLogs.json", serialized2);

  // Index by tokenId
  const logsByTokenId = logs.reduce(
    (acc, log) => {
      const tokenId = log.args.tokenId?.toString() || "";
      acc[tokenId] = log;
      return acc;
    },
    {} as Record<string, any>
  );

  const filteredLogs = Object.values(logsByTokenId);

  // Vp by voter
  const vpByVoter: Record<string, bigint> = filteredLogs.reduce(
    (acc: Record<string, bigint>, log: any) => {
      const voter = log.args.voter?.toString() || "";
      const vp = log.args.votingPowerCastForGauge || 0n;
      acc[voter] = (acc[voter] ?? 0n) + vp;
      return acc;
    },
    {} as Record<string, bigint>
  );

  const result = Object.entries(vpByVoter).map(([voter, vp]) => {
    return { voter, vp: vp.toString() };
  });

  console.log(result.length);

  // write the file to a results.json file
  fs.writeFileSync("results.json", JSON.stringify(result, null, 2));

  return {
    voters: result,
    // gauge,
    // epoch: epoch.toString(),
  };
}

async function get() {
  // connect
  const client = createPublicClient({
    chain: mode,
    transport: http("https://mainnet.mode.network/"),
  });

  // Smart contract details
  const modeVoterAddress = "0x71439Ae82068E19ea90e4F506c74936aE170Cf58";

  const gauges = await getGauges(client, false, modeVoterAddress);
}
