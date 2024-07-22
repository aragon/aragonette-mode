import { IDelegatesSortBy, IDelegatesSortDir } from "@/server/client/types/domain";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { generateDataListState } from "@/utils/query";
import { IconType, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { delegatesList } from "@/features/membership/services/query-options";

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MILLS = 500;
const DEFAULT_SORT = IDelegatesSortBy.FEATURED;

export const useDelegateDataList = (emptyStateCta: () => void) => {
  const [activeSort, setActiveSort] = useState<string>(DEFAULT_SORT);
  const [searchValue, setSearchValue] = useState<string>();
  const [debouncedQuery, setDebouncedQuery] = useDebouncedValue<string | undefined>(
    searchValue?.trim()?.toLowerCase(),
    {
      delay: SEARCH_DEBOUNCE_MILLS,
    }
  );

  const { data, isError, isLoading, isFetching, isRefetching, isFetchingNextPage, refetch, fetchNextPage } =
    useInfiniteQuery({
      ...delegatesList({
        limit: DEFAULT_PAGE_SIZE,
        ...generateSortOptions(),
        ...(debouncedQuery ? { search: debouncedQuery } : {}),
      }),
    });

  const isFiltered = searchValue != null && searchValue.trim().length > 0;
  const filtering = (!!debouncedQuery || !!activeSort) && isFetching && !isRefetching && !isLoading;
  const loading = isLoading || (isError && isRefetching);
  const [dataListState, setDataListState] = useState<DataListState>("initialLoading");

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage, filtering, isFiltered));
  }, [
    isError,
    isFetching,
    isFetchingNextPage,
    loading,
    isRefetching,
    isFiltered,
    debouncedQuery,
    activeSort,
    filtering,
  ]);

  const resetFilters = () => {
    setSearchValue("");
    setDebouncedQuery("");
    setActiveSort("");
  };

  const emptyFilteredState = {
    heading: "No delegates found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      onClick: () => resetFilters(),
    },
  };

  const emptyState = {
    heading: "No delegates found",
    description: "Create your delegate profile",
    primaryButton: {
      label: "Create delegate profile",
      onClick: emptyStateCta,
    },
  };

  const errorState = {
    heading: "Error loading delegates",
    description: "There was an error loading the delegates. Please try again!",
    secondaryButton: {
      label: "Reload delegates",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  const sortItems = [
    {
      value: `${IDelegatesSortBy.FEATURED}`,
      label: "Featured",
      type: "DESC" as const,
    },
    {
      value: `${IDelegatesSortBy.DELEGATION_COUNT}-${IDelegatesSortDir.DESC}`,
      label: "Most delegations",
      type: "DESC" as const,
    },
    {
      value: `${IDelegatesSortBy.VOTING_POWER}-${IDelegatesSortDir.DESC}`,
      label: "Highest voting power",
      type: "DESC" as const,
    },
  ];

  function generateSortOptions() {
    if (!activeSort) return {};

    const [sortBy, sortDir] = activeSort.split("-") as [IDelegatesSortBy, IDelegatesSortDir];
    return { sortBy: sortBy, sortDir: sortDir ?? IDelegatesSortDir.DESC };
  }

  const itemsCount = data?.pagination?.total;
  const entityLabel = itemsCount === 1 ? "Delegate" : "Delegates";
  const showPagination = (itemsCount ?? 0) > DEFAULT_PAGE_SIZE;

  const containerClasses = classNames({
    "grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3": !(
      dataListState === "error" ||
      ((dataListState === "idle" || dataListState === "filtered") && itemsCount === 0) ||
      itemsCount === 0
    ),
  });

  return {
    state: dataListState,
    pageSize: DEFAULT_PAGE_SIZE,
    delegates: data?.delegates ?? [],
    sortItems,
    itemsCount,
    activeSort,
    emptyState,
    errorState,
    entityLabel,
    searchValue,
    showPagination,
    handleLoadMore: fetchNextPage,
    containerClasses,
    handleSortChange: setActiveSort,
    emptyFilteredState,
    handleSearchValueChange: setSearchValue,
  };
};
