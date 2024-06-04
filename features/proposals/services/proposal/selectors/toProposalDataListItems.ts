import { capitalizeFirstLetter } from "@/utils/case";
import type {
  IApprovalThresholdResult,
  IMajorityVotingResult,
  IProposalDataListItemStructureProps,
  ProposalType,
} from "@aragon/ods";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ProposalStages, ProposalTracks, StageOrder, type IProposal, ProposalStatus } from "../domain";

type ProposalListItem = IProposalDataListItemStructureProps & { id: string };

export function toProposalDataListItems(proposals: IProposal[]): ProposalListItem[] {
  return proposals.map((proposal) => {
    const {
      id,
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
    const stageIndex = stages.findIndex((stage) => stage.type === currentStage) ?? 0;
    const activeStage = stages[stageIndex];

    const statusLabel =
      activeStage.type === ProposalStages.DRAFT && status !== ProposalStatus.EXECUTED
        ? activeStage.statusMessage ?? status.toLowerCase()
        : status.toLowerCase();

    // compute date based off of stage
    const date = computeRelativeDate(status, activeStage.voting?.startDate, activeStage.voting?.endDate);
    const tag = isEmergency ? ProposalTracks.EMERGENCY : capitalizeFirstLetter(proposalType);

    // only community voting is mjv; draft has no voting data
    const isMajorityVoting = activeStage.type === ProposalStages.COMMUNITY_VOTING;
    const type: ProposalType = isMajorityVoting ? "majorityVoting" : "approvalThreshold";

    // stage result
    let result: IMajorityVotingResult | IApprovalThresholdResult | undefined;
    if (activeStage.type != ProposalStages.DRAFT && (activeStage.voting?.total_votes ?? 0) > 0) {
      const winningOption = activeStage.voting?.scores.sort((a, b) => b.votes - a.votes)[0];
      const id = StageOrder[activeStage.type];

      result = {
        stage: { id, title: activeStage.type },
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
      status: statusLabel,
      summary,
      title,
      result,
    };
  }) as Array<ProposalListItem>;
}

function computeRelativeDate(status: ProposalStatus, startDate?: string, endDate?: string): string | undefined {
  dayjs.extend(relativeTime);

  switch (status) {
    case ProposalStatus.PENDING:
      return startDate ? dayjs.unix(Number(startDate)).toNow() : undefined;
    case ProposalStatus.REJECTED:
    case ProposalStatus.EXECUTED:
    case ProposalStatus.EXPIRED:
      return endDate ? dayjs.unix(Number(endDate)).fromNow() : undefined;
    default:
      return;
  }
}
