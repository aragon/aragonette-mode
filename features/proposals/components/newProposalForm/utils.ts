import {
  getDHMFromSeconds,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  daysToMills,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from "@/utils/dates";
import { type ProposalCreationFormData } from "./types";

const MIN_DURATION = 4 * 7 * 24 * 60 * 60; //4 weeks in seconds

export function getProposalDates(params: ProposalCreationFormData) {
  const {
    startSwitch,
    durationSwitch,
    start: startDate,
    startTime,
    startUtc,
    durationDays,
    durationHours,
    durationMinutes,
  } = params;

  const { days: minDays, hours: minHours, minutes: minMinutes } = getDHMFromSeconds(MIN_DURATION);

  // getting dates
  let startDateTime: Date;

  /**
   * Here we defined base startDate.
   */
  if (startSwitch === "now") {
    // Taking current time, but we won't pass it to SC cuz it's gonna be outdated. Needed for calculations below.
    startDateTime = new Date(`${getCanonicalDate()}T${getCanonicalTime()}:00${getCanonicalUtcOffset()}`);
  } else {
    // Taking time user has set.
    startDateTime = new Date(`${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`);
  }

  // Minimum allowed end date (if endDate is lower than that SC call fails)
  const minEndDateTimeMills =
    startDateTime.valueOf() + daysToMills(minDays ?? 0) + hoursToMills(minHours ?? 0) + minutesToMills(minMinutes ?? 0);

  // End date
  let endDateTime;

  // user specifies duration in time/second exact way
  if (durationSwitch === "duration") {
    // Calculate the end date using duration
    const endDateTimeMill =
      startDateTime.valueOf() +
      offsetToMills({
        days: Number(durationDays),
        hours: Number(durationHours),
        minutes: Number(durationMinutes),
      });

    endDateTime = new Date(endDateTimeMill);

    // In case the endDate is close to being minimum duration, (and starting immediately)
    if (endDateTime.valueOf() <= minEndDateTimeMills && startSwitch === "now") {
      endDateTime = undefined;
    }
  } else {
    // In case exact time specified by user
    // Calculate the end date using duration
    const endDateTimeMill =
      startDateTime.valueOf() +
      offsetToMills({
        days: minDays,
        hours: minHours,
        minutes: minMinutes,
      });

    endDateTime = new Date(endDateTimeMill);
  }

  if (startSwitch === "date" && endDateTime) {
    // Making sure we are not in past for further calculation
    if (startDateTime.valueOf() < new Date().valueOf()) {
      startDateTime = new Date(`${getCanonicalDate()}T${getCanonicalTime()}:00${getCanonicalUtcOffset()}`);
    }

    // If provided date is expired
    if (endDateTime.valueOf() < minEndDateTimeMills) {
      const legacyStartDate = new Date(`${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`);
      const endMills = endDateTime.valueOf() + (startDateTime.valueOf() - legacyStartDate.valueOf());

      endDateTime = new Date(endMills);
    }
  }

  /**
   * In case "now" as start time is selected, we want
   * to keep startDate undefined, so it's automatically evaluated.
   * If we just provide "Date.now()", than after user still goes through the flow
   * it's going to be date from the past. And SC-call evaluation will fail.
   */
  const finalStartDateInSeconds = startSwitch === "now" ? 0 : startDateTime.valueOf() / 1000;
  const finalEndDateInSeconds = endDateTime ? endDateTime.valueOf() / 1000 : 0;

  return { startDate: finalStartDateInSeconds, endDate: finalEndDateInSeconds };
}
