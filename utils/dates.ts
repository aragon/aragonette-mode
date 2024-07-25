import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// date time
export const HOURS_IN_DAY = 24;
export const MINS_IN_HOUR = 60;
export const MINS_IN_DAY = HOURS_IN_DAY * MINS_IN_HOUR;

// Function to get the simple relative time in days or weeks
export function getSimpleRelativeTimeFromDate(value: Dayjs) {
  dayjs.extend(relativeTime);

  const now = dayjs();
  const targetDate = dayjs(value);

  const diffSeconds = targetDate.diff(now, "second");
  const diffMins = targetDate.diff(now, "minute");
  const diffHours = targetDate.diff(now, "hour");
  const diffDays = targetDate.diff(now, "day");
  const diffWeeks = targetDate.diff(now, "week");

  // Decide whether to show days or weeks
  if (Math.abs(diffSeconds) < 60) {
    return `${Math.abs(diffSeconds)} ${Math.abs(diffSeconds) === 1 ? "second" : "seconds"}`;
  } else if (Math.abs(diffMins) < 60) {
    return `${Math.abs(diffMins)} ${Math.abs(diffMins) === 1 ? "minute" : "minutes"}`;
  } else if (Math.abs(diffHours) < 24) {
    return `${Math.abs(diffHours)} ${Math.abs(diffHours) === 1 ? "hour" : "hours"}`;
  } else if (Math.abs(diffDays) >= 15) {
    return `${Math.abs(diffWeeks)} ${Math.abs(diffWeeks) === 1 ? "week" : "weeks"}`;
  } else {
    return `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "day" : "days"} `;
  }
}

export type Offset = {
  days?: number;
  hours?: number;
  minutes?: number;
};

export function daysToMills(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

export function hoursToMills(hours: number): number {
  return hours * 60 * 60 * 1000;
}

export function minutesToMills(minutes: number): number {
  return minutes * 60 * 1000;
}

export function offsetToMills(offset: Offset) {
  return (
    (offset.days ? daysToMills(offset.days) : 0) +
    (offset.hours ? hoursToMills(offset.hours) : 0) +
    (offset.minutes ? minutesToMills(offset.minutes) : 0)
  );
}

/**
 * Returns the either:
 *
 *  - the current date
 *  - or the current date + the number of days passed as offset
 *
 * as a string with the following format: "yyyy-mm-dd".
 *
 * Note that the offset may be negative. This will return a date in the past.
 *
 * This date format is necessary when working with html inputs of type "date".
 */
export function getCanonicalDate(offset?: Offset, isOffsetBackwards = false): string {
  const currDate = new Date();

  //add offset
  const offsetMills = offset ? offsetToMills(offset) : 0;
  const offsetTime = isOffsetBackwards ? currDate.getTime() - offsetMills : currDate.getTime() + offsetMills;
  const offsetDateTime = new Date(offsetTime);

  //format date
  const month = offsetDateTime.getMonth() + 1;
  const formattedMonth = month > 9 ? `${month}` : `0${month}`;
  const day = offsetDateTime.getDate();
  const formattedDay = day > 9 ? `${day}` : `0${day}`;
  return `${offsetDateTime.getFullYear()}-${formattedMonth}-${formattedDay}`;
}

/**
 * Returns the current time as a string with the following format:
 * "hh:mm".
 *
 * This time format is necessary when working with html inputs of type "time".
 */
export function getCanonicalTime(offset?: Offset): string {
  const currDate = new Date();

  //add offset
  const offsetMills = offset ? offsetToMills(offset) : 0;
  const offsetTime = currDate.getTime() + offsetMills;
  const offsetDateTime = new Date(offsetTime);

  //format time
  const currHours = offsetDateTime.getHours();
  const currMinutes = offsetDateTime.getMinutes();
  const formattedHours = currHours > 9 ? `${currHours}` : `0${currHours}`;
  const formattedMinutes = currMinutes > 9 ? `${currMinutes}` : `0${currMinutes}`;

  return `${formattedHours}:${formattedMinutes}`;
}

/**
 * This method returns a UTC offset with the following format:
 * "[+|-]hh:mm".
 *
 * This format is necessary to construct dates based on a particular timezone
 * offset using the date-fns library.
 *
 * If a formatted offset is provided, it will be mapped to its canonical form.
 * If none is provided, the current timezone offset will be used.
 */
export function getCanonicalUtcOffset(formattedUtcOffset?: string): string {
  const formattedOffset = formattedUtcOffset || getFormattedUtcOffset();
  const noLettersOffset = formattedOffset.slice(3);
  const sign = noLettersOffset.slice(0, 1);
  const time = noLettersOffset.slice(1);
  let canonicalOffset;
  if (time.includes(":")) {
    // if colon present only hours might need padding
    const [hours, minutes] = time.split(":");
    canonicalOffset = `${(hours.length === 1 ? "0" : "") + hours}:${minutes}`;
  } else {
    // if no colon, need to add :00 and maybe padding to hours
    canonicalOffset = `${(time.length === 1 ? "0" : "") + time}:00`;
  }
  return sign + canonicalOffset;
}

/**
 * This method returns the user's UTC offset with the following format:
 * "UTC[+|-](h)?h(:mm)?" (E.g., either UTC+10, UTC-9:30).
 *
 * This format is used to display offsets in the UI.
 */
export function getFormattedUtcOffset(): string {
  const currDate = new Date();
  let decimalOffset = currDate.getTimezoneOffset() / 60;
  const isNegative = decimalOffset < 0;
  decimalOffset = Math.abs(decimalOffset);
  const hourOffset = Math.floor(decimalOffset);
  const minuteOffset = Math.round((decimalOffset - hourOffset) * 60);
  let formattedOffset = `UTC${isNegative ? "+" : "-"}${hourOffset}`;
  formattedOffset += minuteOffset > 0 ? `:${minuteOffset}` : "";
  return formattedOffset;
}

export function getDaysHoursMins(value: number, period: "hours" | "mins" = "mins") {
  if (period === "mins") {
    return {
      days: Math.floor(value / MINS_IN_DAY),
      hours: Math.floor((value / MINS_IN_HOUR) % HOURS_IN_DAY),
      mins: value % MINS_IN_HOUR,
    };
  } else
    return {
      days: Math.floor(value / HOURS_IN_DAY),
      hours: value % HOURS_IN_DAY,
      mins: 0,
    };
}

/**
 * This function returns the days, hours and minutes of seconds
 * @param seconds number of seconds
 * @returns {
 *  days,
 *  hours,
 *  minutes,
 * } an object includes days & hours & minutes
 */
export function getDHMFromSeconds(seconds: number): Offset {
  if (!seconds) return {} as Offset;

  const days = seconds < 86400 ? 0 : seconds / 86400;
  const hours = seconds % 86400 < 3600 ? 0 : (seconds % 86400) / 3600;
  const remainingMinutes = (seconds % 86400) % 3600;
  const minutes = remainingMinutes < 60 ? 0 : remainingMinutes / 60;

  return {
    days: Math.floor(days),
    hours: Math.floor(hours),
    minutes: Math.floor(minutes),
  };
}
