import { type Post } from "@/services/paragraph/types";
import { DataListItem, Heading, Tag, type IDataListItemProps } from "@aragon/ods";
import dayjs from "dayjs";
import Image from "next/image";
import type React from "react";

type IPostDataListItemStructureProps = IDataListItemProps &
  Pick<Post, "categories" | "cover_img" | "publishedAt" | "subtitle" | "title" | "updatedAt">;

export const PostDataListItemStructure: React.FC<IPostDataListItemStructureProps> = (props) => {
  const {
    categories,
    cover_img: { img },
    subtitle,
    title,
    publishedAt,
    ...otherProps
  } = props;

  return (
    <DataListItem className="!md:p-6 flex flex-col gap-y-4 !p-6" {...otherProps}>
      <Image alt={title} src={img.src} height={212} width={400} />
      <div className="gapy-y-1.5 flex max-h-[90px] min-w-0 flex-col">
        <Heading size="h2" className="line-clamp-1">
          {title}
        </Heading>
        <p className="line-clamp-2 text-ellipsis text-lg text-neutral-500">{subtitle}</p>
      </div>
      <div className="flex gap-x-6">
        <span className="flex-1 text-lg leading-tight text-neutral-600">
          {dayjs(publishedAt).format("MMMM DD, YYYY")}
        </span>
        <Tag label={categories[0]} variant="primary" />
      </div>
    </DataListItem>
  );
};
