import { type IHasVoted, type IProposalVote } from "@/features/proposals";
import { checkParam, parseStageParam, printStageParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";
import VercelCache from "@/services/cache/VercelCache";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IHasVoted | IError>) {
  const { proposal_id: proposalId, stage, address } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");
    const parsedAddress = checkParam(address, "address");

    if (!isAddress(parsedAddress)) {
      throw new Error("Invalid address parameter");
    }

    const cache = new VercelCache();

    const stageEnum = printStageParam(parseStageParam(parsedStage));

    const votes = (await cache.get<IProposalVote[]>(`votes-PIP-${parsedProposalId}-${stageEnum}`)) ?? [];

    const filteredVotes = votes.filter((vote) => vote.address === parsedAddress);

    return res.status(200).json({ address: parsedAddress, hasVoted: filteredVotes.length > 0 });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
