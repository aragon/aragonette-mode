import { DataListItem, IconType, StatePingAnimation, Tag, AvatarIcon, type IDataListItemProps } from "@aragon/ods";
import React from "react";
import { formatDate, formatDateTimeToUTC, isEventCurrentlyActive } from "./utils";

type IEventDataListItem = IDataListItemProps & {
  summary?: string | null;
  startTime?: { date?: string | null; dateTime?: string | null; timeZone?: string | null };
  endTime?: { date?: string | null; dateTime?: string | null; timeZone?: string | null };
  publisher?: string;
};

export const EventDataListItem: React.FC<IEventDataListItem> = (props) => {
  const { summary, startTime, endTime, publisher, ...otherProps } = props;

  const eventCurrentlyActive = isEventCurrentlyActive(
    startTime?.dateTime,
    startTime?.timeZone,
    endTime?.dateTime,
    endTime?.timeZone
  );

  return (
    <DataListItem className="!py-0 md:!py-0 lg:!py-0" {...otherProps}>
      <div className="flex flex-col gap-2 py-4">
        <div className="flex gap-x-3">
          {eventCurrentlyActive && (
            <div className="flex flex-1 items-center gap-x-6">
              <Tag label="Now" variant="primary" />
              <span className="flex flex-1 flex-row-reverse">
                <StatePingAnimation variant="primary" />
              </span>
            </div>
          )}
          {!eventCurrentlyActive && (
            <>
              <div className="flex flex-1 items-center gap-x-3 leading-tight text-neutral-500">
                <span className="flex-1">{formatDate(startTime?.dateTime ?? startTime?.date ?? "")}</span>
                <span className="flex-1 text-right">
                  {formatDateTimeToUTC(startTime?.dateTime, startTime?.timeZone)}
                </span>
              </div>
              <AvatarIcon size="sm" variant="neutral" icon={IconType.CALENDAR} />
            </>
          )}
        </div>
        <p className="line-clamp-1 text-xl leading-tight text-neutral-800">{summary ?? "Private event"}</p>
        {publisher && (
          <p className="line-clamp-1 leading-tight text-neutral-500">
            <span className="text-neutral-800">By</span> {publisher}
          </p>
        )}
      </div>
    </DataListItem>
  );
};
