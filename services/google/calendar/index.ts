import { GOOGLE_CALENDAR_API_KEY, PUB_GOOGLE_CALENDAR_CALENDAR_ID } from "@/constants";
import { type IFetchPaginatedParams } from "@/utils/types";
import { auth, calendar_v3, type GaxiosPromise } from "@googleapis/calendar";

export interface IListEventsParams extends Omit<IFetchPaginatedParams, "page"> {
  calendarId?: string;
  pageToken?: string;
}

const DEFAULT_PAGE_SIZE = 2;

class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private primaryCalendarId: string;

  constructor(primaryCalendarId: string = PUB_GOOGLE_CALENDAR_CALENDAR_ID) {
    this.calendar = new calendar_v3.Calendar({ auth: auth.fromAPIKey(GOOGLE_CALENDAR_API_KEY) });
    this.primaryCalendarId = primaryCalendarId;
  }

  async listEvents(params: IListEventsParams = {}): GaxiosPromise<calendar_v3.Schema$Events> {
    const now = new Date().toISOString();

    const response = await this.calendar.events.list({
      calendarId: params.calendarId ?? this.primaryCalendarId,
      maxResults: params.limit ?? DEFAULT_PAGE_SIZE,
      pageToken: params.pageToken,
      timeMin: now,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response;
  }

  async addSharedCalendar(calendarId = this.primaryCalendarId) {
    await this.calendar.calendarList.insert({ requestBody: { id: calendarId } });
  }
}

export const calendarService = new GoogleCalendarService();
