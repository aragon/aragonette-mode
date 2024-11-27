import { NextApiRequest, NextApiResponse } from "next";
import { getGauges } from "./app/getGauges";
import { createPublicClient, http } from "viem";
import { mode } from "viem/chains";

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
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function get() {
  // connect
  const client = createPublicClient({
    chain: mode,
    transport: http("https://mainnet.mode.network/"),
  });

  // Smart contract details
  const modeVoterAddress = "0x71439Ae82068E19ea90e4F506c74936aE170Cf58";

  await getGauges(client, false, modeVoterAddress);
}
