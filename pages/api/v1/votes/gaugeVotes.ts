import { NextApiRequest, NextApiResponse } from "next";
import { BPT_ESCROW_CONTRACT, MODE_ESCROW_CONTRACT } from "@/constants";
import { client, getVoter } from "../../_client";
import { getGauges } from "../gauges";
import { createHiddenHandSummary, fetchVoteAndResetData, flattenUnique, VoteAndResetRawData } from "../../votes/data";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      const voters = await Promise.all([getVoter(MODE_ESCROW_CONTRACT), getVoter(BPT_ESCROW_CONTRACT)]);
      const gauges = await getGauges(client, voters[0]);
      const data = await fetchVoteAndResetData(voters, BigInt(1431));
      const flattened = flattenUnique(data);
      const output = createHiddenHandSummary(flattened, gauges);
      // stringify with bigint to string conversion
      const jsonOutput = JSON.stringify(
        output,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      );
      res.status(200).json({ data: JSON.parse(jsonOutput) });
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
