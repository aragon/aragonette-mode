import { getFeaturedDelegates } from "@/features/membership/services/members/delegates-builder";
import {
  parseDelegatesSortBy,
  parseDelegatesSortDir,
  type IMemberDataListItem,
} from "@/features/membership/services/members/domain";
import { logger } from "@/services/logger";
import { checkNullableParam } from "@/utils/api-utils";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IMemberDataListItem> | IError>
) {
  try {
    const { page, limit, sortBy, sortDir } = req.query;

    const parsedPage = checkNullableParam(page, "page");
    const parsedLimit = checkNullableParam(limit, "limit");
    const parsedSortBy = checkNullableParam(sortBy, "sortBy");
    const parsedSortDir = checkNullableParam(sortDir, "sortDir");

    const typedSortBy = parseDelegatesSortBy(parsedSortBy);
    const typedSortDir = parseDelegatesSortDir(parsedSortDir);

    let pageInt = parseInt(parsedPage ?? "1", 10);
    let limitInt = parseInt(parsedLimit ?? "10", 10);

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      limitInt = 10;
    }

    if (isNaN(pageInt) || pageInt < 1) {
      pageInt = 1;
    }

    const paginatedDelegates = await getFeaturedDelegates(pageInt, limitInt, typedSortBy, typedSortDir);

    res.status(200).json(paginatedDelegates);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching council members:", error);
    res.status(500).json({ error: { message: "Error council members" } });
  }
}
