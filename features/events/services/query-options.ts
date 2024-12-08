import { type IListEventsParams } from "@/services/google/calendar";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { eventService } from "./event-service";

export const eventKeys = {
  all: ["events"] as const,
  list: (params: IListEventsParams) => [...eventKeys.all, params] as const,
};

export function eventList(params: IListEventsParams = {}) {
  return infiniteQueryOptions({
    queryKey: eventKeys.list(params),
    queryFn: async (ctx) => eventService.fetchEvents({ ...params, pageToken: ctx.pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage?.pagination?.cursor,
    select: (data) => ({ events: data.pages.flatMap((p) => p.data), pagination: data.pages[0].pagination }),
  });
}
