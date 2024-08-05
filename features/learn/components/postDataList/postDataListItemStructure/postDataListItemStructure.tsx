import { type Post } from "@/services/paragraph/types";
import { DataList, DateFormat, formatterUtils, Heading, Tag, type IDataListItemProps } from "@aragon/ods";
import classNames from "classnames";
import Image from "next/image";
import type React from "react";

type IPostDataListItemStructure = IDataListItemProps &
  Pick<Post, "categories" | "cover_img" | "createdAt" | "subtitle" | "title">;

export const PostDataListItemStructure: React.FC<IPostDataListItemStructure> = (props) => {
  const { categories, cover_img, subtitle, title, createdAt, ...otherProps } = props;

  const actionItemClasses = classNames("shadow-neutral-sm overflow-hidden !px-3 py-3 !flex flex-col gap-y-3");

  return (
    <DataList.Item className={actionItemClasses} {...otherProps}>
      {cover_img && (
        <Image
          alt={title}
          src={cover_img.img.src}
          height={cover_img.img.height}
          width={cover_img.img.width}
          className="h-full w-full"
        />
      )}
      <div className="flex min-w-0 flex-col gap-y-1.5">
        <Heading size="h3" className="line-clamp-2">
          {title}
        </Heading>
        <p className="line-clamp-2 text-ellipsis text-lg text-neutral-500">{subtitle}</p>
      </div>
      <div className="flex gap-x-6">
        <span className="flex-1 text-lg capitalize leading-tight text-neutral-800">
          {formatterUtils.formatDate(createdAt, { format: DateFormat.YEAR_MONTH_DAY })}
        </span>
        <Tag label={`#${categories[0]}`} variant="primary" />
      </div>
    </DataList.Item>
  );
};
