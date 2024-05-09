import { type IProposalVote, type IProposal } from "@/features/proposals";
import { checkParam, parseStageParam, printStageParam } from "@/utils/api-utils";
import { type IPaginatedResponse, type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import VercelCache from "@/services/cache/VercelCache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposalVote> | IError>
) {
  const { proposal_id: proposalId, stage: stageId } = req.query;

  try {
    const cache = new VercelCache();

    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stageId, "stage");
    const stageEnum = parseStageParam(parsedStage);

    const proposals = await cache.get<IProposal[]>(`proposals`);
    const proposal = proposals?.find((p) => p.pip === `PIP-${parsedProposalId}`);

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    const stage = proposal.stages.find((s) => s.id === stageEnum);

    if (!stage) {
      throw new Error("Stage not found");
    }

    let votes: IProposalVote[] = [];
    if (stage.voting) {
      if (stage.status === "active") {
        // Fresh votes
        votes = await buildVotesResponse(stage.voting.providerId, stage.id);
      } else {
        // Cached votes
        votes =
          (await cache.get<IProposalVote[]>(`votes-PIP-${parsedProposalId}-${printStageParam(stageEnum)}`)) ??
          (await buildVotesResponse(stage.voting.providerId, stage.id));
      }
    }

    res.status(200).json({ data: votes, pagination: { total: votes.length } });
  } catch (error: any) {
    // TODO: Handle error cases
    res.status(400).json({ error: { message: error.message } });
  }
}
