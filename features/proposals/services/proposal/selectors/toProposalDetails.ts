import { PUB_CHAIN } from "@/constants";
import { config } from "@/context/Web3Modal";
import {
  type IVotingStageDetails,
  type IVotingStageResults,
} from "@/features/proposals/components/proposalVoting/votingStage";
import { checkIfProxyContract, fetchAbi } from "@/hooks/useAbi";
import { decodeActionData, type DecodedAction } from "@/hooks/useAction";
import { logger } from "@/services/logger";
import { capitalizeFirstLetter } from "@/utils/case";
import { getSimpleRelativeTimeFromDate } from "@/utils/dates";
import { type Action } from "@/utils/types";
import { getPublicClient } from "@wagmi/core";
import dayjs, { type Dayjs } from "dayjs";
import { type Address, type PublicClient } from "viem";
import { ProposalStages, type IAction, type IProposal, type IProposalStage, type ProposalStatus } from "../domain";

export type DetailedAction = { decoded?: DecodedAction; raw: Action };

export type ProposalDetail = Omit<IProposal, "actions" | "stages"> & {
  actions: DetailedAction[];
  stages: ITransformedStage[];
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

  return {
    ...proposal,
    actions: transformedActions,
    stages: transformStages(proposal.stages),
    createdAt,
    endDate: formattedEndDate,
  };
}

// parse a date string or unix timestamp as a string
function parseDate(date: string | undefined): Dayjs | undefined {
  if (date == null) return;

  const parsedInput = Number(date);

  return !isNaN(parsedInput) ? dayjs.unix(parsedInput) : dayjs(date);
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

export interface ITransformedStage {
  id: ProposalStages;
  title: string;
  status: string;
  disabled: boolean;
  proposalId?: string;
  result?: IVotingStageResults;
  details?: IVotingStageDetails;
}

/**
 * Transforms an array of proposal stages into an array of transformed stages.
 * @param stages - The array of proposal stages to transform.
 * @returns the array of transformed stages.
 */
function transformStages(stages: IProposalStage[]) {
  return generateStages(stages).flatMap((stage) => {
    // filter out draft stage
    if (stage.id === ProposalStages.DRAFT) {
      return [];
    }

    const status = getVotingStatus(stage.status, stage.voting?.startDate, stage.voting?.endDate);

    // prepare active & past voting stage data
    if (stage.voting) {
      const { choices, startDate, endDate, snapshotBlock, total_votes, quorum, providerId } = stage.voting;

      const result = {
        approvalAmount: total_votes,
        approvalThreshold: quorum,
      };

      const details = {
        startDate: startDate ? dayjs.unix(Number(startDate)).utc().format("YYYY/MM/DD h:mm A [UTC]") : "",
        endDate: endDate ? dayjs.unix(Number(endDate)).utc().format("YYYY/MM/DD h:mm A [UTC]") : "",
        strategy: "1 Address → 1 Vote",
        censusBlock: Number(snapshotBlock),
        options: formatChoices(choices),
      };

      return {
        id: stage.id,
        result,
        details,
        title: stage.id,
        disabled: false,
        proposalId: providerId,
        status,
      };
    }

    // return pending or unreached stages
    return {
      id: stage.id,
      title: stage.id,
      status,
      disabled: true,
    };
  });
}

/**
 * Generates stages for a proposal, ensuring all possible stages are included.
 * @param stages - The array of proposal stages.
 * @returns the array of all possible stages.
 */
function generateStages(stages: IProposalStage[]) {
  const stageSet = new Map(stages.map((stage) => [stage.id, stage]));

  for (const stageId of Object.values(ProposalStages)) {
    if (!stageSet.has(stageId)) {
      stageSet.set(stageId, { id: stageId } as IProposalStage);
    }
  }

  return Array.from(stageSet.values());
}

/**
 * Formats an array of voting choices into a readable string.
 * @param choices - The array of voting choices.
 * @returns the formatted string of choices.
 */
function formatChoices(choices: string[]) {
  const parsedChoices = choices.map((choice) => capitalizeFirstLetter(choice));
  return parsedChoices.length > 1
    ? `${parsedChoices.slice(0, -1).join(", ")} or ${parsedChoices[parsedChoices.length - 1]}`
    : parsedChoices[0] || "";
}

/**
 * Determines the voting status based on the current status, start date, and end date.
 * @param status - The current status of the proposal.
 * @param startDate - The start date of the voting stage.
 * @param endDate - The end date of the voting stage.
 * @returns he determined voting status.
 */
const getVotingStatus = (status: ProposalStatus, startDate?: string, endDate?: string) => {
  const startDateIsInFuture = startDate && dayjs(startDate).isAfter(dayjs());
  const startDateIsInThePast = startDate && dayjs(startDate).isBefore(dayjs());
  const endDateIsInTheFuture = endDate && dayjs(endDate).isAfter(dayjs());
  const endDateIsInThePast = endDate && dayjs(endDate).isBefore(dayjs());

  if (endDateIsInThePast) {
    return status;
  } else if (startDateIsInThePast && endDateIsInTheFuture) {
    return "active";
  } else if (startDateIsInFuture) {
    return "pending";
  } else {
    return "unreached";
  }
};
