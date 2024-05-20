import { PUB_CHAIN } from "@/constants";
import { config } from "@/context/Web3Modal";
import { type Action } from "@/utils/types";
import { getPublicClient } from "@wagmi/core";
import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type Address, type PublicClient } from "viem";
import { ProposalStages, type IAction, type IProposal } from "../domain";
import { checkIfProxyContract, fetchAbi } from "@/hooks/useAbi";
import { type DecodedAction, decodeActionData } from "@/hooks/useAction";
import { logger } from "@/services/logger";

export type DetailedAction = { decoded?: DecodedAction; raw: Action };

export type ProposalDetail = Omit<IProposal, "actions" | "createdAt"> & {
  actions: DetailedAction[];
  createdAt?: string;
  endDate?: string;
};

/**
 * Transforms a proposal object into a more detailed structure, including formatted dates. It adds formatted
 * creation and end dates to the proposal details, applying relative time formatting where appropriate.
 *
 * @param proposal - The proposal object to be transformed.
 * @returns the transformed proposal object.
 */
export async function toProposalDetails(proposal: IProposal | undefined): Promise<ProposalDetail | undefined> {
  if (!proposal) return;
  dayjs.extend(relativeTime);

  // decode actions
  let transformedActions: DetailedAction[] = [];
  if (proposal.actions) {
    const client = getPublicClient(config, { chainId: PUB_CHAIN.id });

    if (client) {
      transformedActions = await Promise.all(proposal.actions.map((action) => decodeAction(action, client)));
    }
  }

  // parse dates
  const createdAt = parseDate(proposal.stages.find((stage) => stage.createdAt)?.createdAt)?.format("YYYY-MM-DD");

  // end date is specified on the Council Confirmation stage or
  // when proposal is an emergency -> the Council Approval stage
  const endDate =
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION)?.voting?.endDate ??
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.voting?.endDate;

  const parsedEndDate = parseDate(endDate);
  const formattedEndDate = parsedEndDate ? getSimpleRelativeTimeFromDate(parsedEndDate) : undefined;

  return { ...proposal, actions: transformedActions, createdAt, endDate: formattedEndDate };
}

// parse a date string or unix timestamp as a string
function parseDate(date: string | undefined): Dayjs | undefined {
  if (date == null) return;

  const parsedInput = Number(date);

  return !isNaN(parsedInput) ? dayjs.unix(parsedInput) : dayjs(date);
}

// Function to get the simple relative time in days or weeks
function getSimpleRelativeTimeFromDate(value: Dayjs) {
  const now = dayjs();
  const targetDate = dayjs(value);
  const diffDays = targetDate.diff(now, "day");
  const diffWeeks = targetDate.diff(now, "week");

  // Decide whether to show days or weeks
  if (Math.abs(diffWeeks) > 0 && Math.abs(diffDays) >= 7) {
    return `${Math.abs(diffWeeks)} weeks`;
  } else {
    return `${Math.abs(diffDays)} days`;
  }
}

/**
 * Decodes an action using the provided ABI and returns the raw and decoded action.
 *
 * @param action - The action to decode.
 * @param client - The PublicClient instance used for fetching ABI and checking proxy contracts.
 * @returns an object containing the raw and decoded action.
 * If the action failed to decode, the decoded action will be undefined.
 */
async function decodeAction(action: IAction, client: PublicClient): Promise<DetailedAction> {
  const rawAction = { ...action, value: BigInt(action.value) };

  try {
    const implementationAddress = await checkIfProxyContract(action.to as Address, client);
    const resolvedAddress = implementationAddress ?? (action.to as Address);
    const abi = await fetchAbi(resolvedAddress, client);
    const decodedAction = decodeActionData(abi, rawAction);

    const actionFailedToDecode =
      decodedAction.args.length === 0 && decodedAction.functionName === null && decodedAction.functionAbi === null;

    return { raw: rawAction, decoded: actionFailedToDecode ? undefined : decodedAction };
  } catch (error) {
    logger.error("Failed to decode action", error, { action });
    return { raw: rawAction };
  }
}
