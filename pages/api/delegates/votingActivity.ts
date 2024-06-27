import { SNAPSHOT_SPACE } from "@/constants";
import { getSnapshotVotingActivity } from "@/services/snapshot/votingActivity";
import { parseSnapshotChoice } from "@/services/snapshot/utils";
import proposalRepository from "@/server/models/proposals";
import { logger } from "@/services/logger";
import { checkParam } from "@/server/utils";
import { type IError } from "@/utils/types";
import { StageType } from "@prisma/client";
import { type NextApiRequest, type NextApiResponse } from "next/types";

export type IDelegateVotingActivity = {
  id: string;
  choice: string;
  createdAt: string;
  proposal: {
    id: string;
    title: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<IDelegateVotingActivity[] | IError>) {
  const { address } = req.query;
  const delegate = checkParam(address, "address");

  try {
    // get voting activity
    const votingActivity = await getSnapshotVotingActivity({
      space: SNAPSHOT_SPACE,
      voter: delegate,
    });

    if (!votingActivity || votingActivity.length === 0) {
      logger.info(`No voting activity found for delegate: ${delegate}`);
    }

    let parsedVotingActivity: (IDelegateVotingActivity | null)[] = [];
    if (votingActivity) {
      logger.info(`Augmenting Snapshot voting activity with proposal data...`);

      parsedVotingActivity = await Promise.all(
        votingActivity.map(async ({ id, proposalId, createdAt, choice }) => {
          const proposal = await proposalRepository.getProposalByStage(proposalId, StageType.COMMUNITY_VOTING);

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
    res.status(500).json({ error: { message: "Server error" } });
  }
}
