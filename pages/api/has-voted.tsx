import { type IHasVoted, type IProposalVote, type IProposal } from "@/features/proposals";
import { checkParam, parseStageParam, printStageParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import { getCachedVotes } from "@/features/proposals/providers/utils/votes-builder";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IHasVoted | IError>) {
  const { proposalId, stageId, address } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stageId, "stage");
    const stageEnum = parseStageParam(parsedStage);
    const parsedAddress = checkParam(address, "address");

    if (!isAddress(parsedAddress, { strict: false })) {
      throw new Error("Invalid address parameter");
    }

    const votes = await getCachedVotes(parsedProposalId, stageEnum);

    const hasVoted = votes.some((vote) => vote.address === parsedAddress);

    return res.status(200).json({ address: parsedAddress, hasVoted });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
