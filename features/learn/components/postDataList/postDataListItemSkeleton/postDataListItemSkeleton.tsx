import { DataList, StateSkeletonBar, type IDataListItemProps } from "@aragon/ods";
import classNames from "classnames";
import React from "react";

export interface IPostDataListItemSkeletonProps extends IDataListItemProps {}

export const PostDataListItemSkeleton: React.FC<IPostDataListItemSkeletonProps> = (props) => {
  const { className, ...otherProps } = props;

  return (
    <DataList.Item
      tabIndex={0}
      aria-busy="true"
      aria-label="loading"
      className={classNames("flex flex-col gap-y-3 bg-neutral-0 !px-3 !py-3", className)}
      {...otherProps}
    >
      <div className="h-[140px] w-full animate-pulse bg-neutral-50" />
      <div className="flex min-w-0 flex-col gap-y-1.5">
        <StateSkeletonBar width={"80%"} size="xl" />
        <StateSkeletonBar width={"100%"} size="xl" />
      </div>
      <div className="flex justify-between gap-x-6">
        <StateSkeletonBar width={"40%"} size="xl" />
        <StateSkeletonBar width={"20%"} size="lg" />
      </div>
    </DataList.Item>
  );
};
