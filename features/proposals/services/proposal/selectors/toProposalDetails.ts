import dayjs, { type Dayjs } from "dayjs";
import { ProposalStages, type IProposal } from "../domain";
import relativeTime from "dayjs/plugin/relativeTime";

export type ProposalDetail = IProposal & {
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
export function toProposalDetails(proposal: IProposal | undefined): ProposalDetail | undefined {
  dayjs.extend(relativeTime);

  if (!proposal) return;

  const createdAt = parseDate(proposal.stages.find((stage) => stage.createdAt)?.createdAt)?.format("YYYY-MM-DD");

  // end date is specified on the Council Confirmation stage or
  // when proposal is an emergency -> the Council Approval stage
  const endDate =
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_CONFIRMATION)?.voting?.endDate ??
    proposal.stages.find((stage) => stage.id === ProposalStages.COUNCIL_APPROVAL)?.voting?.endDate;

  const parsedEndDate = parseDate(endDate);

  let formattedEndDate;

  if (parsedEndDate) {
    formattedEndDate = getSimpleRelativeTimeFromDate(parsedEndDate);
  }

  return { ...proposal, createdAt, endDate: formattedEndDate };
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
