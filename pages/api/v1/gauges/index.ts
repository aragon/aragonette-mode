import { NextApiRequest, NextApiResponse } from "next";
import { MODE_ESCROW_CONTRACT } from "@/constants";
import { client, getVoter } from "@/utils/api/client";
import { getAllGauges, getGaugeDetails } from "@/utils/api/gauges";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET": {
      const voter = await getVoter(MODE_ESCROW_CONTRACT);
      const gauges = await getAllGauges(client, voter);
      const gaugeDetails = await getGaugeDetails(client, voter, gauges);
      res.status(200).json({ data: gaugeDetails });
      break;
    }
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
