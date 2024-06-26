import { getVotingActivity } from "@/features/membership/services/members/delegates-builder";
import { type IVoterVotingActivity } from "@/features/membership/services/members/domain";
import { parseSnapshotChoice } from "@/features/proposals/providers/snapshot/utils";
import proposalRepository from "@/features/proposals/repository/proposal";
import { logger } from "@/services/logger";
import { checkParam, parseStageParam } from "@/utils/api-utils";
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
            choice: parseSnapshotChoice(choice),
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
