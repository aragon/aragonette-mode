import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/utils/api/client";
import { summarizeVotesByGauge, fetchVoteAndResetData, flattenUnique } from "@/utils/api/parseVotes";
import { Address } from "viem";
import { getAllGauges, getGaugeDetails } from "@/utils/api/gauges";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const voter = query.voter as Address;
  const epoch = query.epoch as string;
  const gauge = query.gauge as Address;
  let fromBlock = query.fromBlock as string;

  switch (method) {
    case "GET":
      if (!voter || voter.length !== 42 || !voter.startsWith("0x")) {
        res.status(400).json({ error: "Invalid voter address" });
        return;
      }

      if (epoch && isNaN(Number(epoch))) {
        res.status(400).json({ error: "Invalid epoch" });
        return;
      }

      if (!fromBlock || isNaN(Number(fromBlock))) {
        fromBlock = "0";
      }

      // set optional fields
      const optionalEpoch = epoch ? BigInt(epoch) : undefined;
      const gauges = gauge ? [gauge] : await getAllGauges(client, voter);

      // process the data
      const gaugeDetails = await getGaugeDetails(client, voter, gauges);
      const votes = await fetchVoteAndResetData(voter, gauges, optionalEpoch, BigInt(fromBlock));
      const summary = summarizeVotesByGauge(votes, gaugeDetails, voter, epoch);

      res.status(200).json({ data: summary });
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
