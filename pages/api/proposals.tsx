import { type IProposal } from "@/features/proposals";
import { IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { getCacheProposals } from "@/features/proposals/providers/utils/proposal-builder";

export default async function handler(_: NextApiRequest, res: NextApiResponse<IPaginatedResponse<IProposal> | IError>) {
  const proposals = await getCacheProposals();

  // TODO: Paginate proposals
  // TODO: Filter proposals

  res.status(200).json({ data: proposals, pagination: { total: proposals.length } });
}
