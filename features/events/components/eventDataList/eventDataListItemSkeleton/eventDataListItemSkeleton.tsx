import { DataList, StateSkeletonBar, type IDataListItemProps } from "@aragon/ods";
import classNames from "classnames";
import React from "react";

export interface IEventDataListItemSkeletonProps extends IDataListItemProps {}

export const EventDataListItemSkeleton: React.FC<IEventDataListItemSkeletonProps> = (props) => {
  const { className, ...otherProps } = props;

  return (
    <DataList.Item
      tabIndex={0}
      aria-busy="true"
      aria-label="loading"
      className={classNames("h-[118px] !py-0 md:!py-0 lg:!py-0", className)}
      {...otherProps}
    >
      <div className="flex flex-col gap-3 py-4">
        <div className="flex gap-x-3">
          <div className="flex flex-1 items-center justify-between gap-x-3 leading-tight text-neutral-500">
            <StateSkeletonBar size="md" width={"20%"} />
            <StateSkeletonBar size="lg" width={"33%"} />
          </div>
        </div>
        <StateSkeletonBar size="xl" width={"73%"} />
        <StateSkeletonBar size="md" width={"43%"} />
      </div>
    </DataList.Item>
  );
};
