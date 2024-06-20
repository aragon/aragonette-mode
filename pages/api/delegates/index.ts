import { type ICouncilMember } from "@/features/membership/services/members/domain";
import { logger } from "@/services/logger";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import { checkNullableParam } from "@/utils/api-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getFeaturedDelegates } from "@/features/membership/services/members/delegates-builder";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<ICouncilMember> | IError>
) {
  try {
    // TODO: Add sorting by voting power and delegation count
    const { page, limit } = req.query;

    const parsedPage = checkNullableParam(page, "page");
    const parsedLimit = checkNullableParam(limit, "limit");

    let pageInt = parseInt(parsedPage ?? "1", 10);
    let limitInt = parseInt(parsedLimit ?? "10", 10);

    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
      limitInt = 10;
    }

    if (isNaN(pageInt) || pageInt < 1) {
      pageInt = 1;
    }

    const paginatedDelegates = await getFeaturedDelegates(pageInt, limitInt);

    res.status(200).json(paginatedDelegates);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching council members:", error);
    res.status(500).json({ error: { message: "Error council members" } });
  }
}
