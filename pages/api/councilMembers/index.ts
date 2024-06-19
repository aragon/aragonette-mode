import { type ICouncilMember } from "@/features/membership/services/members/domain";
import { GITHUB_COUNCIL_FILENAME, GITHUB_REPO, GITHUB_USER } from "@/constants";
import { getGitHubCouncilMembersData } from "@/features/membership/providers/github";
import { logger } from "@/services/logger";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import { checkNullableParam } from "@/utils/api-utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<ICouncilMember> | IError>
) {
  try {
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

    const councilMembers = await getGitHubCouncilMembersData({
      user: GITHUB_USER,
      repo: GITHUB_REPO,
      council_filename: GITHUB_COUNCIL_FILENAME,
    });

    const paginatedCouncilMembers = {
      pagination: {
        total: councilMembers.length,
        page: pageInt,
        pages: Math.ceil(councilMembers.length / limitInt),
        limit: limitInt,
      },
      data: councilMembers.slice((pageInt - 1) * limitInt, pageInt * limitInt),
    };

    res.status(200).json(paginatedCouncilMembers);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching council members:", error);
    res.status(500).json({ error: { message: "Error council members" } });
  }
}
