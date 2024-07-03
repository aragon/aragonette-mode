import { PostDetail } from "@/components/nav/routes";
import { VotesDataListItemSkeleton } from "@/features/proposals/components/proposalVoting/votesDataList/votesDataListItemSkeleton";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { postListQueryOptions } from "../../services/posts/query-options";
import { PostDataListItemStructure } from "./postDataListItemStructure/postDataListItemStructure";

const DEFAULT_PAGE_SIZE = 6;

export const PostDatList = () => {
  const {
    data: posts,
    isError,
    isLoading,
    isRefetching,
    isRefetchError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery(postListQueryOptions({ category: "daos" }));

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage));
  }, [isError, isFetchingNextPage, loading]);

  const entityLabel = posts?.length === 1 ? "Post" : "Posts";

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
      itemsCount={100}
      onLoadMore={fetchNextPage}
    >
      <DataList.Container
        SkeletonElement={VotesDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
        // className="grid grid-cols-[repeat(auto-fill,_minmax(376px,_1fr))] gap-6"
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
      >
        {posts?.map(({ id, ...otherProps }) => (
          <PostDataListItemStructure {...otherProps} key={id} href={PostDetail.getPath(otherProps.slug)} />
        ))}
      </DataList.Container>
      {(posts?.length ?? 0) > 0 && <DataList.Pagination />}
    </DataList.Root>
  );
};
