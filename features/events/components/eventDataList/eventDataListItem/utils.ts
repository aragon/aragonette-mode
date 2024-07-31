import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import("dayjs/locale/en");
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDate(date?: string) {
  const today = dayjs().startOf("day");
  const tomorrow = dayjs().add(1, "day").startOf("day");
  const inputDate = dayjs(date).startOf("day");

  if (inputDate.isSame(today)) {
    return "Today";
  } else if (inputDate.isSame(tomorrow)) {
    return "Tomorrow";
  } else {
    return inputDate.format("YYYY-MM-DD");
  }
}

export function formatDateTimeToUTC(dateTime?: string | null, timeZone?: string | null) {
  if (!dateTime) {
    return "All day";
  }

  if (timeZone) {
    const utcDateTime = dayjs.tz(dateTime, timeZone).utc();
    return utcDateTime.format("h:mm A [UTC]");
  }
}

export function getSharedGoogleCalendarLink(id: string): string {
  return `https://calendar.google.com/calendar/u/0/embed?src=${id}`;
}
