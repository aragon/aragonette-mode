import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/utils/api/client";
import { summarizeVotesByGauge, fetchVoteAndResetData } from "@/utils/api/parseVotes";
import { Address } from "viem";
import { getAllGauges, getGaugeDetails } from "@/utils/api/gauges";
import { fetchVoterData, transformVoterData } from "@/utils/api/voter";
import fs from "fs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const voter = query.voter as Address;
  const votingContract = query.votingContract as Address;
  const epoch = query.epoch as string;
  const gauge = query.gauge as Address;
  const fromBlock = query.fromBlock as string;

  switch (method) {
    case "GET":
      // if (!voter || voter.length !== 42 || !voter.startsWith("0x")) {
      //   res.status(400).json({ error: "Invalid voter address" });
      //   return;
      // }
      //
      // if (epoch && isNaN(Number(epoch))) {
      //   res.status(400).json({ error: "Invalid epoch" });
      //   return;
      // }
      //
      // if (!fromBlock || isNaN(Number(fromBlock))) {
      //   fromBlock = "0";
      // }
      //
      // set optional fields
      const optionalEpoch = epoch ? BigInt(epoch) : "all";
      const gauges = gauge ? [gauge] : await getAllGauges(client, votingContract);

      // // process the data
      const voterData = await fetchVoterData(votingContract, voter, optionalEpoch, gauges, BigInt(fromBlock));
      const transformed = transformVoterData(voterData);

      res.status(200).json({ data: transformed });
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
