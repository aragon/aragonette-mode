import { NextApiRequest, NextApiResponse } from "next";
import { MODE_ESCROW_CONTRACT } from "@/constants";
import { client, getVotingContract } from "@/utils/api/client";
import { getAllGauges, getGaugeDetails } from "@/utils/api/gauges";
import { Address, isAddress } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const votingContract = (req.query.votingContract ?? (await getVotingContract(MODE_ESCROW_CONTRACT))) as Address;

  switch (method) {
    case "GET": {
      if (!isAddress(votingContract)) {
        res.status(400).json({ error: "Invalid voting contract address" });
        return;
      }
      const gauges = await getAllGauges(client, votingContract);
      const gaugeDetails = await getGaugeDetails(client, votingContract, gauges);
      res.status(200).json({ data: gaugeDetails });
      break;
    }
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
