import { checkNullableParam } from "@/server/utils";
import { calendarService } from "@/services/google/calendar";
import { logger } from "@/services/logger";
import { type IError, type IInfiniteDataResponse } from "@/utils/types";
import { type calendar_v3 } from "@googleapis/calendar";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IInfiniteDataResponse<calendar_v3.Schema$Event> | IError>
) {
  const { calendarId, pageToken, limit } = req.query;
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=59");

  const parsedCalendarId = checkNullableParam(calendarId, "calendarId");
  const parsedPageToken = checkNullableParam(pageToken, "pageToken");
  const parsedLimit = checkNullableParam(limit, "limit");

  let limitInt = parseInt(parsedLimit ?? "2", 10);

  if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
    limitInt = 4;
  }

  try {
    const calResponse = await calendarService.listEvents({
      calendarId: parsedCalendarId,
      pageToken: parsedPageToken,
      limit: limitInt,
    });

    const events = calResponse.data.items ?? [];
    const nextPageToken = calResponse.data.nextPageToken ?? undefined;

    const response = {
      data: events,
      pagination: { hasNextPage: !!nextPageToken, cursor: nextPageToken },
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error("Error fetching calendar events:", error);
    res.status(500).json({ error: { message: "Failed to fetch calendar events" } });
  }
}
