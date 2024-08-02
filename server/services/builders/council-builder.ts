import { COUNCIL_MEMBERS, type ICouncilMemberDataListItem } from "@/council";
import { logger } from "@/services/logger";

/**
 * Coucil members are hardcoded at this time, however this behavior can be changed in the future to fetch the data from an external source.
 */
export const getCouncilMembers = async function (): Promise<ICouncilMemberDataListItem[]> {
  logger.info("Fetching council members...");
  return COUNCIL_MEMBERS;
};
