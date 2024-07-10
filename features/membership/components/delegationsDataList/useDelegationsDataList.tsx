import { delegationsList } from "@/features/membership/services/query-options";
import { generateDataListState } from "@/utils/query";
import { IconType, type DataListState } from "@aragon/ods";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 3;

export const useDelegationsDataList = (delegate: string) => {
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
    ...delegationsList({ address: delegate }),
    placeholderData: keepPreviousData,
  });

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage));
  }, [isError, isFetchingNextPage, loading]);

  const emptyState = {
    heading: "No delegations received yet",
  };

  const errorState = {
    heading: "Error loading delegations",
    description: "There was an error loading the delegations. Try again!",
    secondaryButton: {
      label: "Reload delegations",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  const itemsCount = data?.pagination?.total;
  const showPagination = (itemsCount ?? 0) > DEFAULT_PAGE_SIZE;
  const entityLabel = itemsCount === 1 ? "Delegation" : "Delegations";
  const showGrid = !(dataListState === "error" || (itemsCount != null && itemsCount === 0));
  const containerClasses = classNames({
    "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3": showGrid,
  });

  return {
    state: dataListState,
    pageSize: DEFAULT_PAGE_SIZE,
    errorState,
    emptyState,
    itemsCount,
    entityLabel,
    delegations: data?.members ?? [],
    handleLoadMore: fetchNextPage,
    showPagination,
    containerClasses,
  };
};
