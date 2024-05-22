import { type IProposal } from "@/features/proposals";
import { IError, type IPaginatedResponse } from "@/utils/types";
import { checkNullableParam } from "@/utils/api-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getVotingData } from "@/features/proposals/providers";
import proposalRepository, {
  parseProposalSortBy,
  parseProposalSortDir,
  parsedProposalStatus,
} from "@/features/proposals/repository/proposal";
import { logger } from "@/services/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposal> | IError>
) {
  try {
    const { page, limit, sortBy, sortDir, search, status } = req.query;

    const parsedPage = checkNullableParam(page, "page");
    const parsedLimit = checkNullableParam(limit, "limit");
    const parsedSortBy = checkNullableParam(sortBy, "sortBy");
    const parsedSortDir = checkNullableParam(sortDir, "sortDir");
    const parsedSearch = checkNullableParam(search, "search");
    const parsedStatus = checkNullableParam(status, "status");

    let pageInt = parseInt(parsedPage ?? "1", 10);
    let limitInt = parseInt(parsedLimit ?? "10", 10);

    const typedSortBy = parseProposalSortBy(parsedSortBy);
    const typedSortDir = parseProposalSortDir(parsedSortDir);
    const typedStatus = parsedProposalStatus(parsedStatus);

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      limitInt = 10;
    }

    if (isNaN(pageInt) || pageInt < 1) {
      pageInt = 1;
    }

    const paginatedProposals = await proposalRepository.getProposals(
      pageInt,
      limitInt,
      typedSortBy,
      typedSortDir,
      parsedSearch,
      typedStatus
    );

    for (const proposal of paginatedProposals.data) {
      for (const stage of proposal.stages) {
        //TODO: Check if active after fixing dates/statuses [new Date(stage.voting.endDate) < new Date()]?
        if (stage.voting) {
          const voting = await getVotingData(stage.type, stage.voting.providerId);
          stage.voting = voting;
        }
      }
    }

    res.status(200).json(paginatedProposals);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching proposals:", error);
    res.status(500).json({ error: { message: "Error fetching proposals" } });
  }
}
