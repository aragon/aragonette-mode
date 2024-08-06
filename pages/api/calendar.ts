import { checkNullableParam } from "@/server/utils";
import Cache from "@/services/cache/VercelCache";
import { calendarService } from "@/services/google/calendar";
import { logger } from "@/services/logger";
import { type IError, type IInfiniteDataResponse } from "@/utils/types";
import { type calendar_v3 } from "@googleapis/calendar";
import { waitUntil } from "@vercel/functions";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IInfiniteDataResponse<calendar_v3.Schema$Event> | IError>
) {
  const { calendarId, pageToken, limit } = req.query;

  const parsedCalendarId = checkNullableParam(calendarId, "calendarId");
  const parsedPageToken = checkNullableParam(pageToken, "pageToken");
  const parsedLimit = checkNullableParam(limit, "limit");

  let limitInt = parseInt(parsedLimit ?? "4", 10);

  if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
    limitInt = 4;
  }

  try {
    const cacheKey = `calendar-events-${parsedCalendarId}-${limitInt}`;
    const cache = new Cache();

    let cachedEvents: any = await cache.get(cacheKey);

    if (!cachedEvents) {
      const response = await calendarService.listEvents({
        calendarId: parsedCalendarId,
        pageToken: parsedPageToken,
        limit: limitInt,
      });

      if (!response.status || response.status >= 400) {
        logger.error("Failed to fetch calendar events. Response:", response);
        return res.status(500).json({ error: { message: "Failed to fetch calendar events" } });
      }

      const events = response.data.items ?? [];
      const nextPageToken = response.data.nextPageToken ?? undefined;

      cachedEvents = { events, nextPageToken };

      waitUntil(cache.set(cacheKey, { events, nextPageToken }, 60 * 60));
    }

    res.status(200).json({
      data: cachedEvents.events,
      pagination: { hasNextPage: !!cachedEvents.nextPageToken, cursor: cachedEvents.nextPageToken },
    });
  } catch (error) {
    logger.error("Error fetching calendar events:", error);
    res.status(500).json({ error: { message: "Failed to fetch calendar events" } });
  }
}
