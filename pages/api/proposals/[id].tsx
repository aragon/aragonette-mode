import { type IProposal } from "@/features/proposals";
import { IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedProposals } from "@/features/proposals/providers/utils/proposal-builder";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IProposal | IError>) {
  const { id } = req.query;

  const proposals = await getCachedProposals();

  const proposal = proposals.find((proposal) => proposal.pip === `PIP-${id}`);

  if (!proposal) {
    return res.status(404).json({ error: { message: "Proposal not found" } });
  }

  res.status(200).json(proposal);
}
