import { capitalizeFirstLetter } from "@/utils/case";
import type {
  IApprovalThresholdResult,
  IMajorityVotingResult,
  IProposalDataListItemStructureProps,
  ProposalType,
} from "@aragon/ods";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ProposalStages, ProposalTracks, StageOrder, type IProposal } from "../domain";

type ProposalListItem = IProposalDataListItemStructureProps & { id: string };

export function toProposalDataListItems(proposals: IProposal[]): ProposalListItem[] {
  return proposals.map((proposal) => {
    const {
      pip: id,
      status,
      type: proposalType,
      stages,
      currentStage,
      description: summary,
      title,
      isEmergency,
      publisher,
    } = proposal;

    // get active stage
    const stageIndex = stages.findIndex((stage) => stage.id === currentStage) ?? 0;
    const activeStage = stages[stageIndex];

    // compute date based off of stage
    const date = computeRelativeDate(status, activeStage.voting?.startDate, activeStage.voting?.endDate);
    const tag = isEmergency ? ProposalTracks.EMERGENCY : capitalizeFirstLetter(proposalType);

    // only community voting is mjv; draft has no voting data
    const isMajorityVoting = activeStage.id === ProposalStages.COMMUNITY_VOTING;
    const type: ProposalType = isMajorityVoting ? "majorityVoting" : "approvalThreshold";

    // stage result
    let result: IMajorityVotingResult | IApprovalThresholdResult | undefined;
    if (status !== "draft" && (activeStage.voting?.total_votes ?? 0) > 0) {
      const winningOption = activeStage.voting?.scores.sort((a, b) => b.votes - a.votes)[0];
      const id = StageOrder[activeStage.id];

      result = {
        stage: { id, title: activeStage.id },
        ...(isMajorityVoting
          ? ({
              option: winningOption?.choice,
              voteAmount: winningOption?.votes?.toString() ?? "0",
              votePercentage: (winningOption?.percentage ?? 0) * 100,
            } as IMajorityVotingResult)
          : ({
              approvalAmount: activeStage.voting?.total_votes ?? 0,
              approvalThreshold: activeStage.voting?.quorum ?? 0,
            } as IApprovalThresholdResult)),
      };
    }

    return {
      date,
      id,
      type,
      tag,
      publisher,
      status,
      summary,
      title,
      voted: false,
      result,
    };
  }) as Array<ProposalListItem>;
}

function computeRelativeDate(status: string, startDate?: string, endDate?: string): string | undefined {
  dayjs.extend(relativeTime);

  switch (status) {
    case "pending":
      return startDate ? dayjs.unix(Number(startDate)).toNow() : undefined;
    case "rejected":
    case "queued":
    case "accepted":
    case "partiallyExecuted":
    case "executed":
    case "expired":
    case "failed":
      return endDate ? dayjs.unix(Number(endDate)).fromNow() : undefined;
    default:
      return;
  }
}
