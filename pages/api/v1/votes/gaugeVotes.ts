import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/utils/api/client";
import { summarizeVotesByGauge, fetchVoteAndResetData } from "@/utils/api/parseVotes";
import { Address, isAddress } from "viem";
import { getAllGauges, getGaugeDetails } from "@/utils/api/gauges";
import { isNumberlikeOrAll } from "@/utils/api/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const votingContract = query.votingContract as Address;
  const epoch = query.epoch as string | "all";
  const gauge = query.gauge as Address | "all";
  let fromBlock = query.fromBlock as string;

  switch (method) {
    case "GET":
      if (!isAddress(votingContract)) {
        res.status(400).json({ error: "Invalid voting contract address" });
        return;
      }

      if (!isNumberlikeOrAll(epoch)) {
        res.status(400).json({ error: "Invalid epoch" });
        return;
      }

      if (gauge !== "all" && !isAddress(gauge)) {
        res.status(400).json({ error: "Invalid gauge address" });
        return;
      }

      if (!fromBlock || isNaN(Number(fromBlock))) {
        fromBlock = "0";
      }

      // set optional fields
      const gauges = gauge === "all" ? await getAllGauges(client, votingContract) : [gauge];

      // process the data
      const gaugeDetails = await getGaugeDetails(client, votingContract, gauges);
      const votes = await fetchVoteAndResetData(votingContract, gauges, epoch, BigInt(fromBlock));
      const summary = summarizeVotesByGauge(votes, gaugeDetails, votingContract, epoch);

      res.status(200).json({ data: summary });
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
