import { getCouncilMembers } from "@/features/membership/services/members/delegates-builder";
import { type ICouncilMember } from "@/features/membership/services/members/domain";
import { logger } from "@/services/logger";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse<ICouncilMember[] | IError>) {
  try {
    const councilMembers = await getCouncilMembers();

    res.status(200).json(councilMembers);
  } catch (error) {
    // TODO: Add error handling
    logger.error("Error fetching featured delegates:", error);
    res.status(500).json({ error: { message: "Error fetching featured delegates" } });
  }
}
