import { type IProposal } from "@/features/proposals";
import { buildProposalResponse } from "@/features/proposals/providers/utils/proposal-builder";
import { type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse<IPaginatedResponse<IProposal>>) {
  //TODO: Handle error cases
  const proposals = await buildProposalResponse();

  res.status(200).json({ data: proposals, pagination: { total: proposals.length } });
}
