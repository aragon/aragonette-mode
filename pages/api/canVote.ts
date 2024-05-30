import { type ICanVote } from "@/features/proposals";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import { buildVotingPowerResponse } from "@/features/proposals/providers/utils/votes-builder";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";
import proposalRepository from "@/features/proposals/repository/proposal";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ICanVote | IError>) {
  const { proposalId, stage, address } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");
    const stageEnum = parseStageParam(parsedStage);
    const parsedAddress = checkParam(address, "address");

    if (!isAddress(parsedAddress, { strict: false })) {
      throw new Error("Invalid address parameter");
    }

    const proposal = await proposalRepository.getProposalById(parsedProposalId);

    if (!proposal) {
      return res.status(404).json({ error: { message: "Proposal not found" } });
    }

    const proposalStage = proposal.stages.find((s) => s.id === `${proposal.id}-${stageEnum}`);

    if (!proposalStage) {
      return res.status(404).json({ error: { message: "Stage not found" } });
    }

    //TODO: Check if active after fixing dates/statuses [new Date(stage.voting.endDate) < new Date()]?
    if (!proposalStage.voting) {
      return res.status(404).json({ error: { message: "Voting not found" } });
    }

    const vp = await buildVotingPowerResponse(proposalStage.voting.providerId, stageEnum, parsedAddress);

    const canVote = vp > 0;

    return res.status(200).json({ address: parsedAddress, canVote, vp });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
