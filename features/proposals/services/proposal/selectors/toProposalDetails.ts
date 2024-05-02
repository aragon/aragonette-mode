import dayjs from "dayjs";
import { ProposalStages, type IProposal } from "../domain";

export type ProposalDetail = IProposal & {
  createdAt?: string;
  endDate?: string;
};

export function toProposalDetails(proposal: IProposal | undefined): ProposalDetail | undefined {
  if (!proposal) return;

  const createdAt = parseCreatedAt(proposal.stages.find((stage) => stage.createdAt)?.createdAt);

  // end date is specified on the Council Confirmation stage or
  // when proposal is an emergency -> the Council Approval stage
  const endDate =
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION && stage.endTimestamp)
      ?.endTimestamp ??
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL && stage.endTimestamp)?.endTimestamp;

  return { ...proposal, createdAt, endDate };
}

function parseCreatedAt(date: string | undefined): string {
  if (date == null) return "unknown date";

  const parsedInput = Number(date);

  return (!isNaN(parsedInput) ? dayjs.unix(parsedInput) : dayjs(date)).format("YYYY-MM-DD");
}
