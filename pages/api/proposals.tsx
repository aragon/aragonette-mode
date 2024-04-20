import { type IProposal } from "@/features/proposals";
import { buildProposalResponse } from "@/features/proposals/providers/utils/proposal-builder";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  proposals: IProposal[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  //TODO: Handle error cases
  const proposals = await buildProposalResponse();

  res.status(200).json({ proposals });
}
