import { getDelegates } from "@/server/services/builders/delegates-builder";
import { parseDelegatesSortBy, parseDelegatesSortDir, type IMemberDataListItem } from "@/server/client/types/domain";
import { logger } from "@/services/logger";
import { checkNullableParam } from "@/server/utils";
import { parsePaginationParams } from "@/utils/pagination";
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

    const { page: pageInt, limit: limitInt } = parsePaginationParams(parsedPage, parsedLimit);

    const paginatedDelegates = await getDelegates(pageInt, limitInt, typedSortBy, typedSortDir);

    res.status(200).json(paginatedDelegates);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching delegates:", error);
    res.status(500).json({ error: { message: "Error fetching delegates" } });
  }
}
