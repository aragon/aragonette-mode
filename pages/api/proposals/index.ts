import { type IProposal } from "@/features/proposals";
import proposalRepository, {
  parseProposalStatus,
  parseProposalSortBy,
  parseProposalSortDir,
  parseProposalType,
} from "@/server/models/proposals";
import { buildVotingResponse } from "@/server/services/builders/proposal-builder";
import { checkNullableParam } from "@/server/utils";
import Cache from "@/services/cache/VercelCache";
import { logger } from "@/services/logger";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import { waitUntil } from "@vercel/functions";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IProposal> | IError>
) {
  try {
    const { page, limit, sortBy, sortDir, search, status, type, cached } = req.query;

    const parsedPage = checkNullableParam(page, "page");
    const parsedLimit = checkNullableParam(limit, "limit");
    const parsedSortBy = checkNullableParam(sortBy, "sortBy");
    const parsedSortDir = checkNullableParam(sortDir, "sortDir");
    const parsedSearch = checkNullableParam(search, "search");
    const parsedStatus = checkNullableParam(status, "status");
    const parsedType = checkNullableParam(type, "type");
    const parsedCached = checkNullableParam(cached, "cached");

    let pageInt = parseInt(parsedPage ?? "1", 10);
    let limitInt = parseInt(parsedLimit ?? "10", 10);

    const typedSortBy = parseProposalSortBy(parsedSortBy);
    const typedSortDir = parseProposalSortDir(parsedSortDir);
    const typedStatus = parseProposalStatus(parsedStatus);
    const typedCached = parsedCached === "true";

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      limitInt = 10;
    }

    if (isNaN(pageInt) || pageInt < 1) {
      pageInt = 1;
    }

    const cacheKey = `proposals-${pageInt}-${limitInt}-${typedSortBy}-${typedSortDir}-${parsedSearch}-${typedStatus}-${parsedType}`;
    const cache = new Cache();

    if (typedCached) {
      const cachedProposals: any = await cache.get(cacheKey);

      if (cachedProposals) {
        return res.status(200).json(cachedProposals);
      }
    }

    const paginatedProposals = await proposalRepository.getProposals(
      pageInt,
      limitInt,
      typedSortBy,
      typedSortDir,
      parsedSearch,
      typedStatus,
      parseProposalType(parsedType)
    );

    for (const proposal of paginatedProposals.data) {
      for (const stage of proposal.stages) {
        //TODO: Check if active after fixing dates/statuses [new Date(stage.voting.endDate) < new Date()]?
        const res = await buildVotingResponse(stage);
        if (res) {
          const [voting, status, overallStatus] = res;
          // TODO: Update stage and proposal statuses in the database
          stage.voting = voting;
          stage.status = status;
          proposal.status = overallStatus;
        }
      }
    }

    waitUntil(cache.set(cacheKey, paginatedProposals, 60 * 15)); // 15 minutes

    res.status(200).json(paginatedProposals);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching proposals:", error);
    res.status(500).json({ error: { message: "Error fetching proposals" } });
  }
}
