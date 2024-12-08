import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/utils/api/client";
import { Address, isAddress } from "viem";
import { getAllGauges } from "@/utils/api/gauges";
import { fetchVoterData, transformVoterData } from "@/utils/api/voter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const voter = query.voter as Address;
  const gauge = query.gauge as Address;
  const votingContract = query.votingContract as Address;
  const epoch = query.epoch as string;
  const fromBlock = (query.fromBlock ?? "0") as string;

  switch (method) {
    case "GET":
      console.log(`Fetching voter data for ${voter} in epoch ${epoch} from block ${fromBlock}`);
      if (!isAddress(votingContract)) {
        res.status(400).json({ error: "Invalid voting contract address" });
        return;
      }

      if (gauge && !isAddress(gauge)) {
        res.status(400).json({ error: "Invalid gauge address" });
        return;
      }

      if (!isAddress(voter)) {
        res.status(400).json({ error: "Invalid voter address" });
        return;
      }

      // require the epoch to be a number
      if (!epoch || (epoch && isNaN(Number(epoch)))) {
        if (epoch !== "all") {
          res.status(400).json({ error: "Invalid epoch" });
        }
        return;
      }

      console.log(`Fetching voter data for ${voter} in epoch ${epoch} from block ${fromBlock}`);
      const gauges = gauge ? [gauge] : await getAllGauges(client, votingContract);

      // process the data
      const voterData = await fetchVoterData(votingContract, voter, epoch as bigint | "all", gauges, BigInt(fromBlock));
      const transformed = transformVoterData(voterData, votingContract);

      res.status(200).json({ data: transformed });
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
