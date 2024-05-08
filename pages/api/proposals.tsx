import { type IProposal } from "@/features/proposals";
import { IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import VercelCache from "@/services/cache/VercelCache";

export default async function handler(_: NextApiRequest, res: NextApiResponse<IPaginatedResponse<IProposal> | IError>) {
  // TODO: Handle error cases
  const cache = new VercelCache();

  const proposals = (await cache.get<IProposal[]>("proposals")) ?? [];

  // TODO: Paginate proposals
  // TODO: Filter proposals

  res.status(200).json({ data: proposals, pagination: { total: proposals.length } });
}
