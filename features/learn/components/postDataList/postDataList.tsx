import { PostDetail } from "@/components/nav/routes";
import { VotesDataListItemSkeleton } from "@/features/proposals/components/proposalVoting/votesDataList/votesDataListItemSkeleton";
import { generateDataListState } from "@/utils/query";
import { DataList, type DataListState, IconType } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { postListQueryOptions } from "../../services/posts/query-options";
import { PostDataListItemStructure } from "./postDataListIemStructure/postDataListItemStructure";

const DEFAULT_PAGE_SIZE = 3;

export type PostCategory = "pg" | "sscg" | "ctg";

interface IPostDataListProps {
  category: PostCategory;
}

export const PostDatList: React.FC<IPostDataListProps> = ({ category }) => {
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
  } = useInfiniteQuery(postListQueryOptions({ category }));

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

  return (
    <DataList.Root
      entityLabel={entityLabel}
      pageSize={DEFAULT_PAGE_SIZE}
      state={dataListState}
      itemsCount={total}
      onLoadMore={fetchNextPage}
    >
      <DataList.Container
        SkeletonElement={VotesDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
        className={classNames({ "grid grid-cols-[repeat(auto-fill,_minmax(328px,_1fr))] gap-3": total !== 0 })}
      >
        {data?.posts?.map((post) => (
          <PostDataListItemStructure
            key={post.id}
            href={PostDetail.getPath(post.slug)}
            title={post.title}
            subtitle={post.subtitle}
            createdAt={post.createdAt}
            cover_img={post.cover_img}
            categories={post.categories}
          />
        ))}
      </DataList.Container>
      {total > DEFAULT_PAGE_SIZE && <DataList.Pagination />}
    </DataList.Root>
  );
};
