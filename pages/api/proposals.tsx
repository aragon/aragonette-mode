import type { NextApiRequest, NextApiResponse } from "next";
import { buildProposalResponse } from "../../services/providers/utils/proposal-builder";
import { type ProposalResponse } from "@/services/providers/utils/types";

type ResponseData = {
  proposals: ProposalResponse[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  //TODO: Handle error cases
  const proposals = await buildProposalResponse();

  res.status(200).json({ proposals });
}
