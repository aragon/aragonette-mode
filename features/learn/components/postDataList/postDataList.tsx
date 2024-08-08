import { PostDetail } from "@/components/nav/routes";
import { generateDataListState } from "@/utils/query";
import { Button, DataList, type DataListState, IconType } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { postListQueryOptions } from "../../services/posts/query-options";
import { PostDataListItemSkeleton } from "./postDataListItemSkeleton/postDataListItemSkeleton";
import { PostDataListItemStructure } from "./postDataListItemStructure/postDataListItemStructure";

const DEFAULT_PAGE_SIZE = 3;

export type PostCategory = "pg" | "sscg" | "ctg" | "featured";

interface IPostDataListProps {
  category: PostCategory;
  pageSize?: number;
  hideCategory?: boolean;
}

export const PostDatList: React.FC<IPostDataListProps> = ({
  category,
  hideCategory = false,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
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
  } = useInfiniteQuery(postListQueryOptions({ category, limit: pageSize }));

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage));
  }, [isError, isFetchingNextPage, loading]);

  const total = data?.pagination.total ?? 0;
  const entityLabel = total === 1 ? "Post" : "Posts";

  const emptyFilteredState = {
    heading: "No posts found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
    },
  };

  const emptyState = {
    heading: "No posts published yet",
  };

  const errorState = {
    heading: "Error loading posts",
    description: "There was an error loading the posts. Try again!",
    secondaryButton: {
      label: "Reload posts",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  const showViewAll = (data?.pagination.total ?? 0) > pageSize;

  return (
    <div className="flex flex-col gap-y-6">
      <DataList.Root
        entityLabel={entityLabel}
        pageSize={pageSize}
        state={dataListState}
        itemsCount={total}
        onLoadMore={fetchNextPage}
      >
        <DataList.Container
          id="illustration-container"
          SkeletonElement={PostDataListItemSkeleton}
          errorState={errorState}
          emptyState={emptyState}
          emptyFilteredState={emptyFilteredState}
          className={classNames({
            "grid grid-cols-1 !gap-4 !gap-x-6 md:grid-cols-2 lg:grid-cols-3":
              total !== 0 || dataListState === "initialLoading",
          })}
        >
          {data?.posts?.map((post) => (
            <PostDataListItemStructure
              key={post.id}
              href={PostDetail.getPath(post.slug)}
              title={post.title}
              subtitle={post.subtitle}
              createdAt={post.createdAt}
              cover_img={post.cover_img}
              categories={hideCategory ? post.categories.filter((c) => c !== category) : post.categories}
            />
          ))}
        </DataList.Container>
      </DataList.Root>
      {showViewAll && (
        <span>
          <Button className="!rounded-full" variant="secondary" size="md">
            View all
          </Button>
        </span>
      )}
    </div>
  );
};
