import { type IProposalVote } from "@/features/proposals";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { ProposalStages } from "@/features/proposals/services";
import { type IPaginatedResponse, type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

const parseStageParam = (stage: string): ProposalStages => {
  switch (stage) {
    case "draft":
      return ProposalStages.DRAFT;
    case "council-approval":
      return ProposalStages.COUNCIL_APPROVAL;
    case "community-voting":
      return ProposalStages.COMMUNITY_VOTING;
    case "council-confirmation":
      return ProposalStages.COUNCIL_CONFIRMATION;
    default:
      throw new Error("Invalid stage");
  }
};

const checkParam = (param: string | string[] | undefined, name: string): string => {
  if (!param) {
    throw new Error(`Missing ${name} parameter`);
  }

  if (Array.isArray(param)) {
    throw new Error(`Invalid ${name} parameter`);
  }

  return param;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposal_id: proposalId, stage } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");

    const proposals = await buildVotesResponse(parsedProposalId, parseStageParam(parsedStage));

    res.status(200).json({ data: proposals, pagination: { total: proposals.length } });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
