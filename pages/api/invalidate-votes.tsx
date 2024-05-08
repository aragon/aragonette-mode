import type { NextApiRequest, NextApiResponse } from "next";
import VercelCache from "@/services/cache/VercelCache";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IProposal } from "@/features/proposals";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { proposal_id: proposalId, stage } = req.query;

  try {
    const parsedProposalId = checkParam(proposalId, "proposalId");
    const parsedStage = checkParam(stage, "stage");

    const cache = new VercelCache();

    const proposals = (await cache.get<IProposal[]>("proposals")) ?? [];

    const proposal = proposals.find((proposal) => proposal.pip === parsedProposalId);
    if (!proposal) {
      throw new Error(`Proposal with id ${parsedProposalId} not found`);
    }

    const proposalStage = await proposal.stages.find((stage) => stage.id === parsedStage);
    if (!proposalStage) {
      throw new Error(`Stage with id ${parsedStage} not found`);
    }

    const providerId = proposalStage.voting?.providerId;
    if (!providerId) {
      return [];
    }

    const stageEnum = parseStageParam(parsedStage);

    const votes = await buildVotesResponse(providerId, stageEnum);

    await cache.set(`votes-${proposal.pip}-${stageEnum}`, votes);

    res.status(200).json({ success: true });
  } catch (error: any) {
    // TODO: Handle error cases
    res.status(400).json({ error: { message: error.message } });
  }
}
