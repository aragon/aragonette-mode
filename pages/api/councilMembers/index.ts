import { GITHUB_COUNCIL_FILENAME, GITHUB_REPO, GITHUB_USER } from "@/constants";
import { getGitHubCouncilMembersData } from "@/features/membership/providers/github";
import { type ICouncilMember } from "@/features/membership/services/members/domain";
import { logger } from "@/services/logger";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ICouncilMember[] | IError>) {
  try {
    const councilMembers = await getGitHubCouncilMembersData({
      user: GITHUB_USER,
      repo: GITHUB_REPO,
      council_filename: GITHUB_COUNCIL_FILENAME,
    });

    res.status(200).json(councilMembers);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching council members:", error);
    res.status(500).json({ error: { message: "Error council members" } });
  }
}
