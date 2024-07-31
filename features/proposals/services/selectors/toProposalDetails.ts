import { PUB_CHAIN, PUB_TOKEN_SYMBOL } from "@/constants";
import { config } from "@/context/Web3Modal";
import {
  type IBreakdownApprovalThresholdResult,
  type IBreakdownMajorityVotingResult,
  type IVotingStageDetails,
} from "@/features/proposals/components";
import { checkIfProxyContract, fetchAbi } from "@/hooks/useAbi";
import { decodeActionData, type DecodedAction } from "@/hooks/useAction";
import { logger } from "@/services/logger";
import { capitalizeFirstLetter } from "@/utils/case";
import { getSimpleRelativeTimeFromDate } from "@/utils/dates";
import { type Action } from "@/utils/types";
import { NumberFormat, type ProposalType, formatterUtils } from "@aragon/ods";
import { getPublicClient } from "@wagmi/core";
import dayjs, { type Dayjs } from "dayjs";
import { type Address, type PublicClient } from "viem";
import { ProposalStages, StageOrder, StageStatus, type IAction, type IProposal, type IProposalStage } from "../domain";

export type DetailedAction = { decoded?: DecodedAction; raw: Action };

export type ProposalDetail = Omit<IProposal, "actions" | "createdAt" | "stages"> & {
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

  const createdAt = parseDate(proposal.createdAt)?.format("YYYY-MM-DD");
  // end date is specified on the Council Confirmation stage or
  // when proposal is an emergency -> the Council Approval stage
  const endDate =
    proposal.stages.find((stage) => stage.type === ProposalStages.COUNCIL_CONFIRMATION)?.voting?.endDate ??
    proposal.stages.find((stage) => stage.type === ProposalStages.COUNCIL_APPROVAL)?.voting?.endDate;

  const parsedEndDate = parseDate(endDate);
  const formattedEndDate = parsedEndDate ? getSimpleRelativeTimeFromDate(parsedEndDate) : undefined;

  return {
    ...proposal,
    actions: transformedActions,
    stages: transformStages(proposal.stages, proposal.id, !!proposal.isEmergency, endDate),
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

export interface ITransformedStage<TType extends ProposalType = ProposalType> {
  id: string;
  type: ProposalStages;
  variant: TType;
  title: string;
  status: string;
  disabled: boolean;
  proposalId?: string;
  providerId?: string;
  result?: TType extends "approvalThreshold" ? IBreakdownApprovalThresholdResult : IBreakdownMajorityVotingResult;
  details?: IVotingStageDetails;
}

/**
 * Transforms an array of proposal stages into an array of transformed stages.
 * @param stages - The array of proposal stages to transform.
 * @returns the array of transformed stages.
 */
function transformStages(
  stages: IProposalStage[],
  proposalId: string,
  isEmergency: boolean,
  expirationDate: string | undefined
): ITransformedStage[] {
  return generateStages(stages).flatMap((stage) => {
    // filter out draft stage
    if (stage.type === ProposalStages.DRAFT || stage.type === ProposalStages.TRANSPARENCY_REPORT) {
      return [];
    }

    // filer out community voting and council confirmation stages for emergency proposals
    if (
      isEmergency &&
      (stage.type === ProposalStages.COMMUNITY_VOTING || stage.type === ProposalStages.COUNCIL_CONFIRMATION)
    ) {
      return [];
    }

    const status = getVotingStatus(stage.status, stage.voting?.startDate, expirationDate);

    if (stage.voting) {
      const { choices, startDate, endDate, snapshotBlock, total_votes, quorum, providerId, scores } = stage.voting;

      const variant: ProposalType =
        stage.type === ProposalStages.COMMUNITY_VOTING ? "majorityVoting" : "approvalThreshold";

      const result =
        variant === "approvalThreshold"
          ? {
              approvalAmount: total_votes,
              approvalThreshold: quorum,
            }
          : {
              votingScores:
                scores.length > 0
                  ? scores.map((score) => ({
                      option: score.choice,
                      voteAmount: formatterUtils.formatNumber(score.votes.toString(), {
                        format: NumberFormat.TOKEN_AMOUNT_SHORT,
                      }),
                      votePercentage: score.percentage,
                      tokenSymbol: PUB_TOKEN_SYMBOL,
                    }))
                  : choices.map((choice) => ({
                      option: choice,
                      voteAmount: "0",
                      votePercentage: 0,
                      tokenSymbol: PUB_TOKEN_SYMBOL,
                    })),
            };

      const details = {
        startDate: parseDate(startDate)?.utc().format("YYYY/MM/DD h:mm A [UTC]") ?? "",
        endDate: parseDate(endDate)?.utc().format("YYYY/MM/DD h:mm A [UTC]") ?? "",
        strategy: variant === "approvalThreshold" ? "1 Address → 1 Vote" : "1 Token → 1 Vote",
        censusBlock: Number(snapshotBlock),
        options: variant === "approvalThreshold" ? "Approve" : formatChoices(choices),
      };

      return {
        id: stage.id,
        type: stage.type,
        result,
        details,
        title: stage.type,
        variant,
        disabled: false,
        proposalId,
        providerId,
        status,
      } as ITransformedStage;
    }

    // return pending or unreached stages
    return {
      id: stage.id,
      type: stage.type ?? stage.id,
      title: stage.type ?? stage.id,
      variant: "approvalThreshold",
      status,
      disabled: true,
    } as ITransformedStage;
  });
}

/**
 * Generates stages for a proposal, ensuring all possible stages are included.
 * @param stages - The array of proposal stages.
 * @returns the array of all possible stages.
 */
function generateStages(stages: IProposalStage[]) {
  const stageSet = new Map(stages.map((stage) => [stage.type, stage]));

  for (const stageId of Object.values(ProposalStages)) {
    if (!stageSet.has(stageId)) {
      stageSet.set(stageId, { type: stageId } as IProposalStage);
    }
  }

  return Array.from(stageSet.values()).sort((a, b) => StageOrder[a.type] - StageOrder[b.type]);
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
 * @param expirationDate - The end date of the proposal.
 * @returns the determined voting status.
 */
const getVotingStatus = (status: StageStatus, startDate?: string, expirationDate?: string) => {
  const startDateIsInFuture = startDate && dayjs(startDate).isAfter(dayjs());
  const expirationDateIsInFuture = expirationDate && dayjs(expirationDate).isAfter(dayjs());

  if (startDate == null || startDateIsInFuture) {
    return expirationDateIsInFuture ? StageStatus.PENDING : "unreached";
  }

  return status;
};
