import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function getSimpleRelativeTimestamp(timestamp: number) {
  const targetDate = dayjs(timestamp);
  return getRelative(targetDate);
}

// Function to get the simple relative time in days or weeks
export function getSimpleRelativeDate(strDate?: string) {
  if (!strDate) return "";
  const targetDate = dayjs(strDate);
  return getRelative(targetDate);
}

// Internal

function getRelative(targetDate: Dayjs) {
  const now = dayjs();
  const isPast = targetDate.isBefore(now);

  const diffSecs = Math.abs(targetDate.diff(now, "second"));
  if (diffSecs < 60) {
    if (diffSecs === 0) return "now";
    else if (diffSecs === 1) {
      return isPast ? "1 second ago" : `in 1 second`;
    }
    return isPast ? `${diffSecs} seconds ago` : `in ${diffSecs} seconds`;
  }

  const diffMins = Math.abs(targetDate.diff(now, "minute"));
  if (diffMins < 60) {
    if (diffMins === 1) {
      return isPast ? "1 minute ago" : `in 1 minute`;
    }
    return isPast ? `${diffMins} minutes ago` : `in ${diffMins} minutes`;
  }

  const diffHours = Math.abs(targetDate.diff(now, "hour"));
  if (diffHours < 60) {
    if (diffHours === 1) {
      return isPast ? "1 hour ago" : `in 1 hour`;
    }
    return isPast ? `${diffHours} hours ago` : `in ${diffHours} hours`;
  }

  const diffDays = Math.abs(targetDate.diff(now, "day"));
  if (diffDays < 60) {
    if (diffDays === 1) {
      return isPast ? "1 day ago" : `in 1 day`;
    }
    return isPast ? `${diffDays} days ago` : `in ${diffDays} days`;
  }

  const diffWeeks = Math.abs(targetDate.diff(now, "week"));
  if (diffWeeks < 60) {
    if (diffWeeks === 1) {
      return isPast ? "1 week ago" : `in 1 week`;
    }
    return isPast ? `${diffWeeks} weeks ago` : `in ${diffWeeks} weeks`;
  }

  const diffMonths = Math.abs(targetDate.diff(now, "month"));
  if (diffMonths < 60) {
    if (diffMonths === 1) {
      return isPast ? "1 month ago" : `in 1 month`;
    }
    return isPast ? `${diffMonths} months ago` : `in ${diffMonths} months`;
  }

  const diffYears = Math.abs(targetDate.diff(now, "month"));
  if (diffYears === 1) {
    return isPast ? "1 year ago" : `in 1 year`;
  }
  return isPast ? `${diffYears} years ago` : `in ${diffYears} years`;
}
