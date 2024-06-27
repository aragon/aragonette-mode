import { type IProposal } from "@/features/proposals";
import { buildLiveProposalResponse } from "@/server/services/builders/proposal-builder";
import proposalRepository from "@/server/models/proposals";
import { checkParam } from "@/server/utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IProposal | IError>) {
  const { id } = req.query;
  const parsedId = checkParam(id, "proposalId");

  try {
    const proposal = await proposalRepository.getProposalById(parsedId);

    if (!proposal) {
      return res.status(404).json({ error: { message: "Proposal not found" } });
    }

    const freshProposal = await buildLiveProposalResponse(proposal);
    await proposalRepository.upsertProposal(freshProposal);

    res.status(200).json(freshProposal);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
