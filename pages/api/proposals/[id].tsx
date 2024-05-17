import { type IProposal } from "@/features/proposals";
import { IError } from "@/utils/types";
import { checkParam } from "@/utils/api-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import proposalRepository from "@/features/proposals/repository/proposal";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IProposal | IError>) {
  const { id } = req.query;

  const parsedId = checkParam(id, "id");

  const proposal = await proposalRepository.getProposalById(parsedId);

  if (!proposal) {
    return res.status(404).json({ error: { message: "Proposal not found" } });
  }

  res.status(200).json(proposal);
}
