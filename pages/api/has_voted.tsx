import { type IHasVoted } from "@/features/proposals";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IHasVoted | IError>) {
  const { proposal_id: proposalId, stage, address } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");
    const parsedAddress = checkParam(address, "address");

    if (!isAddress(parsedAddress)) {
      throw new Error("Invalid address parameter");
    }

    //TODO: Replace with a proper way to get the votes (cache or store)
    const votes = await buildVotesResponse(parsedProposalId, parseStageParam(parsedStage));

    const filteredVotes = votes.filter((vote) => vote.address === parsedAddress);

    return res.status(200).json({ address: parsedAddress, hasVoted: filteredVotes.length > 0 });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
