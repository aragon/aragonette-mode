import { PUB_TOKEN_SYMBOL } from "@/constants";
import {
  formatterUtils,
  NumberFormat,
  type IApprovalThresholdResult,
  type IMajorityVotingResult,
  type IProposalDataListItemStructureProps,
  type ProposalType,
} from "@aragon/ods";
import { ProposalStages, ProposalStatus, type IProposal } from "../domain";

type ProposalListItem = IProposalDataListItemStructureProps & { id: string };

export function toProposalDataListItems(proposals: IProposal[]): ProposalListItem[] {
  return proposals.map((proposal) => {
    const { id, status, stages, currentStage, description: summary, title, publisher } = proposal;

    // get active stage
    const stageIndex = stages.findIndex((stage) => stage.type === currentStage) ?? 0;
    const activeStage = stages[stageIndex];

    const statusLabel =
      activeStage.type === ProposalStages.DRAFT && status !== ProposalStatus.EXECUTED
        ? activeStage.statusMessage ?? status.toLowerCase()
        : status.toLowerCase();

    // compute date based off of stage
    const endDate =
      proposal.stages.find((stage) => stage.type === ProposalStages.COUNCIL_CONFIRMATION)?.voting?.endDate ??
      proposal.stages.find((stage) => stage.type === ProposalStages.COUNCIL_APPROVAL)?.voting?.endDate;

    const date = getRelativeDate(status, activeStage.voting?.startDate, endDate);

    // only community voting is mjv; draft has no voting data
    const isMajorityVoting = activeStage.type === ProposalStages.COMMUNITY_VOTING;
    const type: ProposalType = isMajorityVoting ? "majorityVoting" : "approvalThreshold";

    // stage result
    let result: IMajorityVotingResult | IApprovalThresholdResult | undefined;
    if (
      activeStage.type != ProposalStages.DRAFT &&
      activeStage.type != ProposalStages.TRANSPARENCY_REPORT &&
      (activeStage.voting?.total_votes ?? 0) > 0
    ) {
      const winningOption = activeStage.voting?.scores.sort((a, b) => b.votes - a.votes)[0];

      result = {
        ...(isMajorityVoting
          ? ({
              option: winningOption?.choice,
              voteAmount: `${formatterUtils.formatNumber(winningOption?.votes?.toString() ?? 0, { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ${PUB_TOKEN_SYMBOL}`,
              votePercentage: winningOption?.percentage ?? 0,
            } as IMajorityVotingResult)
          : ({
              approvalAmount: activeStage.voting?.total_votes ?? 0,
              approvalThreshold: activeStage.voting?.quorum ?? 0,
            } as IApprovalThresholdResult)),
      };
    }

    return {
      id,
      date,
      type,
      publisher,
      status: statusLabel,
      summary,
      title,
      result,
    };
  }) as Array<ProposalListItem>;
}

function getRelativeDate(status: ProposalStatus, startDate?: string, endDate?: string): string | undefined {
  switch (status) {
    case ProposalStatus.PENDING:
      return startDate;
    case ProposalStatus.REJECTED:
    case ProposalStatus.EXECUTED:
    case ProposalStatus.EXPIRED:
      return endDate;
    default:
      return;
  }
}
