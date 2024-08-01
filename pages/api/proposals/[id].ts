import { type IProposal } from "@/features/proposals";
import proposalRepository from "@/server/models/proposals";
import { buildLiveProposalResponse } from "@/server/services/builders/proposal-builder";
import { checkParam } from "@/server/utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/services/logger";
import { waitUntil } from "@vercel/functions";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IProposal | IError>) {
  const { id } = req.query;
  const parsedId = checkParam(id, "proposalId");

  try {
    const proposal = await proposalRepository.getProposalById(parsedId);

    if (!proposal) {
      return res.status(404).json({ error: { message: "Proposal not found" } });
    }

    const freshProposal = await buildLiveProposalResponse(proposal);
    if (!freshProposal) {
      return res.status(200).json(proposal);
    }

    waitUntil(proposalRepository.upsertProposal(freshProposal));

    return res.status(200).json(freshProposal);
  } catch (error) {
    logger.error(`Failed to fetch proposal. ProposalId: ${parsedId}, Error:`, error);
    res.status(500).json({ error: { message: "Server error" } });
  }
}
