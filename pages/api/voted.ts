import { type IVoted } from "@/features/proposals";
import proposalRepository from "@/server/models/proposals";
import { buildVotesResponse } from "@/server/services/builders/votes-builder";
import { checkParam, parseStageParam } from "@/server/utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IVoted | IError>) {
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

    const votes = await buildVotesResponse(proposalStage.voting.providerId, stageEnum);

    const hasVoted = votes.some((vote) => vote.address.toLowerCase() === parsedAddress.toLowerCase());

    return res.status(200).json({ address: parsedAddress, hasVoted });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
