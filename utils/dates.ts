import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Function to get the simple relative time in days or weeks
export function getSimpleRelativeTimeFromDate(value: Dayjs) {
  dayjs.extend(relativeTime);

  const now = dayjs();
  const targetDate = dayjs(value);
  const diffDays = targetDate.diff(now, "day");
  const diffWeeks = targetDate.diff(now, "week");

  // Decide whether to show days or weeks
  if (Math.abs(diffDays) >= 15) {
    return `${Math.abs(diffWeeks)} ${Math.abs(diffWeeks) === 1 ? "week" : "weeks"}`;
  } else {
    return `${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? "day" : "days"} `;
  }
}
