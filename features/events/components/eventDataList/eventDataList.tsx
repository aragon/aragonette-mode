import { PUB_GOOGLE_CALENDAR_CALENDAR_ID } from "@/constants";
import { generateDataListState } from "@/utils/query";
import { Button, DataList, type DataListState, IconType } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { eventList } from "../../services/query-options";
import { EventDataListItem } from "./eventDataListItem/eventDataListItem";
import { getSharedGoogleCalendarLink } from "./eventDataListItem/utils";
import { EventDataListItemSkeleton } from "./eventDataListItemSkeleton/eventDataListItemSkeleton";

const DEFAULT_PAGE_SIZE = 3;

export const EventDataList: React.FC = () => {
  const {
    data,
    isError,
    isLoading,
    isRefetching,
    isRefetchError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    ...eventList({ limit: DEFAULT_PAGE_SIZE }),
    select: (data) => ({
      events: data.pages.flatMap((p) =>
        p.data.map((e) => ({
          id: e.id,
          summary: e.summary,
          start: e.start,
          end: e.end,
          creator: e.creator?.displayName ?? e.creator?.email,
          link: e.htmlLink ?? "",
          recurring: e.recurrence,
        }))
      ),
      pagination: data.pages[0].pagination,
    }),
  });

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage));
  }, [isError, isFetchingNextPage, loading]);

  const total = data?.pagination.total ?? 0;
  const entityLabel = total === 1 ? "Event" : "Events";

  const emptyState = {
    heading: "No upcoming events",
  };

  const errorState = {
    heading: "Error loading events",
    description: "There was an error loading the upcoming events. Try again!",
    secondaryButton: {
      label: "Reload upcoming events",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  return (
    <DataList.Root
      entityLabel={entityLabel}
      pageSize={DEFAULT_PAGE_SIZE}
      state={dataListState}
      itemsCount={total}
      onLoadMore={fetchNextPage}
    >
      <DataList.Container
        id="illustration-container"
        SkeletonElement={EventDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
      >
        {data?.events?.map((e) => (
          <EventDataListItem
            href={e.link}
            key={e.id}
            summary={e.summary}
            startTime={e.start}
            endTime={e.end}
            publisher={e.creator}
            rel="noopener noreferrer"
            target="_blank"
          />
        ))}
      </DataList.Container>
      <span className="flex">
        <Button
          className="!rounded-full"
          variant="secondary"
          size="md"
          rel="noopener noreferrer"
          target="_blank"
          href={getSharedGoogleCalendarLink(PUB_GOOGLE_CALENDAR_CALENDAR_ID)}
        >
          View all
        </Button>
      </span>
    </DataList.Root>
  );
};
