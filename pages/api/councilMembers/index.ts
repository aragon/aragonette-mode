import { getCouncilMembers } from "@/server/services/builders/council-builder";
import { type ICouncilMemberDataListItem } from "@/server/client/types/domain";
import { logger } from "@/services/logger";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_: NextApiRequest, res: NextApiResponse<ICouncilMemberDataListItem[] | IError>) {
  try {
    const councilMembers = await getCouncilMembers();

    res.status(200).json(councilMembers);
  } catch (error) {
    logger.error("Error fetching council members:", error);
    res.status(500).json({ error: { message: "Error fetching council members" } });
  }
}
