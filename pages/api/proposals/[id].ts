import { type IProposal } from "@/features/proposals";
import { buildVotingResponse } from "@/features/proposals/providers";
import proposalRepository from "@/features/proposals/repository/proposal";
import { checkParam } from "@/utils/api-utils";
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

    for (const stage of proposal.stages) {
      //TODO: Check if active after fixing dates/statuses [new Date(stage.voting.endDate) < new Date()]?
      const voting = await buildVotingResponse(stage);
      stage.voting = voting;
    }

    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
