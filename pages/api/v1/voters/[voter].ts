import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/utils/api/serverClient";
import { Address, isAddress } from "viem";
import { getAllGauges } from "@/utils/api/gauges";
import { fetchVoterData, transformVoterData } from "@/utils/api/voter";
import { isNumberlikeOrAll } from "@/utils/api/validation";
import { getStakingContract } from "@/utils/api/getContracts";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const voter = query.voter as Address;
  const gauge = query.gauge as Address | "all";
  const votingContract = query.votingContract as Address;
  const epoch = query.epoch as string;
  const fromBlock = (query.fromBlock ?? "0") as string;

  switch (method) {
    case "GET":
      if (!isAddress(votingContract)) {
        res.status(400).json({ error: "Invalid voting contract address" });
        return;
      }

      // cast here to avoid type errors but we check immediately after
      const stakingContract = (await getStakingContract(votingContract)) as Address;
      if (!isAddress(stakingContract as string)) {
        res.status(400).json({ error: "Error fetching staking contract" });
        return;
      }

      if (gauge !== "all" && !isAddress(gauge)) {
        res.status(400).json({ error: "Invalid gauge address" });
        return;
      }

      if (!isAddress(voter)) {
        res.status(400).json({ error: "Invalid voter address" });
        return;
      }

      if (!isNumberlikeOrAll(epoch)) {
        res.status(400).json({ error: "Invalid epoch" });
        return;
      }

      const gauges = gauge === "all" ? await getAllGauges(client, votingContract) : [gauge];

      // process the data
      const voterData = await fetchVoterData(votingContract, voter, epoch, gauges, stakingContract, BigInt(fromBlock));
      const transformed = transformVoterData(voterData, votingContract);

      res.status(200).json({ data: transformed });
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
