import type { NextApiRequest, NextApiResponse } from "next";
import VercelCache from "@/services/cache/VercelCache";
import { buildProposalResponse } from "@/features/proposals/providers/utils/proposal-builder";
import { buildVotesResponse } from "@/features/proposals/providers/utils/votes-builder";
import { printStageParam } from "@/utils/api-utils";

export default async function handler(_: NextApiRequest, res: NextApiResponse<any>) {
  // TODO: Enable authentication for cron job
  /*
  const authHeader = req.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return response.status(401).json({ success: false });
  }
  */

  const cache = new VercelCache();

  try {
    //TODO: Handle error cases
    const proposals = await buildProposalResponse();

    await cache.set("proposals", proposals);

    for (const proposal of proposals) {
      for (const stage of proposal.stages) {
        if (!stage.voting) {
          continue;
        }
        if (stage.status === "active") {
          continue;
        }
        const votes = await buildVotesResponse(stage.voting.providerId, stage.id);

        const stageParam = printStageParam(stage.id);

        // TODO: Use a better key
        await cache.set(`votes-${proposal.pip}-${stageParam}`, votes);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    // TODO: Handle error cases
    res.status(500).json({ error: { message: "Internal server error" } });
  }
}
