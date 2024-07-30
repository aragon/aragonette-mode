import { GOOGLE_PRIMARY_CALENDAR_ID, BASE64_GOOGLE_SERVICE_CREDENTIALS } from "@/constants";
import { type IFetchPaginatedParams } from "@/utils/types";
import { calendar_v3, type GaxiosPromise } from "@googleapis/calendar";
import { JWT } from "google-auth-library";

export interface IListEventsParams extends Omit<IFetchPaginatedParams, "page"> {
  calendarId?: string;
  pageToken?: string;
}

const DEFAULT_PAGE_SIZE = 4;

class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private primaryCalendarId: string;

  constructor() {
    const decodedCredentials = Buffer.from(BASE64_GOOGLE_SERVICE_CREDENTIALS, "base64").toString("utf-8");
    const credentials = JSON.parse(decodedCredentials);

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      keyId: credentials.private_key_id,
      project_id: credentials.project_id,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.calendar = new calendar_v3.Calendar({ auth });
    this.primaryCalendarId = GOOGLE_PRIMARY_CALENDAR_ID;
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
