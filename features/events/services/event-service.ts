import { PUB_API_BASE_URL } from "@/constants";
import { type IListEventsParams } from "@/services/google/calendar";
import { encodeSearchParams } from "@/utils/query";
import { type IInfiniteDataResponse } from "@/utils/types";
import { type calendar_v3 } from "@googleapis/calendar";

class EventService {
  async fetchEvents(params: IListEventsParams) {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/calendar`, params);
    const response = await fetch(url);
    const parsed: IInfiniteDataResponse<calendar_v3.Schema$Event> = await response.json();
    return parsed;
  }
}

export const eventService = new EventService();
