import { type IProposal } from "@/features/proposals";
import { buildLiveProposalResponse } from "@/features/proposals/providers";
import proposalRepository from "@/features/proposals/repository/proposal";
import { checkParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IProposal | IError>) {
  const { id } = req.query;
  const parsedId = checkParam(id, "proposalId");

  try {
    let proposal = await proposalRepository.getProposalById(parsedId);

    if (!proposal) {
      return res.status(404).json({ error: { message: "Proposal not found" } });
    }

    const freshProposal = await buildLiveProposalResponse(proposal);
    await proposalRepository.upsertProposal(freshProposal);

    proposal = freshProposal;

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
