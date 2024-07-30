import { AvatarIcon, DataListItem, IconType, type IDataListItemProps } from "@aragon/ods";
import React from "react";
import { formatDate, formatDateTimeToUTC } from "./utils";

interface IEventDataListItem extends IDataListItemProps {
  summary?: string | null;
  startTime?: { date?: string | null; dateTime?: string | null; timeZone?: string | null };
  publisher?: string;
}

export const EventDataListItem: React.FC<IEventDataListItem> = (props) => {
  const { summary, startTime, publisher, ...otherProps } = props;

  return (
    <DataListItem className="!py-0 md:!py-0 lg:!py-0" {...otherProps}>
      <div className="flex flex-col gap-2 py-4">
        <div className="flex gap-x-3">
          <div className="flex flex-1 items-center gap-x-3 leading-tight text-neutral-500">
            <span className="flex-1">{formatDate(startTime?.dateTime ?? startTime?.date ?? "")}</span>
            <span className="flex-1 text-right">{formatDateTimeToUTC(startTime?.dateTime, startTime?.timeZone)}</span>
          </div>
          <AvatarIcon size="sm" variant="neutral" icon={IconType.CALENDAR} />
        </div>
        <p className="line-clamp-1 text-xl leading-tight text-neutral-800">{summary}</p>
        <p className="line-clamp-1 leading-tight text-neutral-600">
          <span className="text-neutral-800">By</span> {publisher}
        </p>
      </div>
    </DataListItem>
  );
};
