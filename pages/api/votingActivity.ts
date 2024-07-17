import { ProposalStages } from "@/features/proposals";
import { type IVoterVotingActivity } from "@/server/client/types/domain";
import proposalRepository from "@/server/models/proposals";
import { getVotingActivity } from "@/server/services/builders/delegates-builder";
import { checkParam, parseStageParam } from "@/server/utils";
import { logger } from "@/services/logger";
import { parseSnapshotChoice } from "@/services/snapshot/utils";
import { type IError } from "@/utils/types";
import { type NextApiRequest, type NextApiResponse } from "next/types";
import { getAddress } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IVoterVotingActivity[] | IError>) {
  try {
    const { address: addressParam, stage: stageParam } = req.query;
    const address = checkParam(addressParam, "address");
    const stage = checkParam(stageParam, "stage");

    const stageEnum = parseStageParam(stage);
    const parsedAddress = getAddress(address);

    // get voting activity
    logger.info(`Fetching voting activity for: ${parsedAddress} with stage: ${stageEnum}`);
    const votingActivity = await getVotingActivity(parsedAddress, stageEnum);

    if (!votingActivity || votingActivity.length === 0) {
      logger.info(`No voting activity found for: ${parsedAddress}`);
    }

    let parsedVotingActivity: (IVoterVotingActivity | null)[] = [];
    if (votingActivity) {
      logger.info(`Augmenting voting activity with proposal data...`);

      parsedVotingActivity = await Promise.all(
        votingActivity.map(async ({ id, providerId, createdAt, choice }) => {
          const proposal = await proposalRepository.getProposalByStage(providerId, stageEnum);

          if (!proposal) return null;

          return {
            id,
            choice: stageEnum === ProposalStages.COMMUNITY_VOTING ? parseSnapshotChoice(choice) : choice,
            createdAt,
            proposal: { id: proposal?.id, title: proposal?.title },
          };
        })
      );
    }

    res.status(200).json(parsedVotingActivity.flatMap((v) => v ?? []));
  } catch (error) {
    logger.error(`Failed to fetch voting activity:`, error);
    res.status(500).json({ error: { message: "Server error" } });
  }
}
