import { ProposalStages, type IProposal } from "../domain";

export type ProposalDetail = IProposal & {
  startDate?: string;
  endDate?: string;
};

export function toProposalDetails(proposal: IProposal | undefined): ProposalDetail | undefined {
  if (!proposal) return;

  const startDate = proposal.stages.find((stage) => stage.startTimestamp)?.startTimestamp;

  // end date is specified on the Council Confirmation stage or
  // when proposal is an emergency -> the Council Approval stage
  const endDate =
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION && stage.endTimestamp)
      ?.endTimestamp ??
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL && stage.endTimestamp)?.endTimestamp;

  return { ...proposal, startDate, endDate };
}
