import { MemberProfile } from "@/components/nav/routes";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { delegatesList } from "../../../services/members/query-options";
import { generateSortOptions, sortItems } from "./utils";

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MILLS = 500;

interface IDelegateMemberListProps {
  onAnnounceDelegation: () => void;
}

export const DelegateMemberList: React.FC<IDelegateMemberListProps> = ({ onAnnounceDelegation }) => {
  const [activeSort, setActiveSort] = useState<string>();
  const [searchValue, setSearchValue] = useState<string>();
  const [debouncedQuery, setDebouncedQuery] = useDebouncedValue<string | undefined>(
    searchValue?.trim()?.toLowerCase(),
    {
      delay: SEARCH_DEBOUNCE_MILLS,
    }
  );

  const {
    data: delegatesQueryData,
    isError,
    isLoading,
    isFetching,
    isRefetching,
    isRefetchError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    ...delegatesList({
      limit: DEFAULT_PAGE_SIZE,
      ...(activeSort ? generateSortOptions(activeSort) : {}),
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    }),
  });

  const isFiltered = searchValue != null && searchValue.trim().length > 0;
  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage, isFetching && !isRefetching, isFiltered)
  );

  useEffect(() => {
    setDataListState(
      generateDataListState(loading, isError, isFetchingNextPage, isFetching && !isRefetching, isFiltered)
    );
  }, [isError, isFetching, isFetchingNextPage, loading, isRefetching, isFiltered]);

  useEffect(() => {
    if (!!debouncedQuery || !!activeSort) {
      setDataListState("loading");
    }
  }, [debouncedQuery, activeSort]);

  const resetFilters = () => {
    setSearchValue("");
    setDebouncedQuery("");
    setActiveSort("");
  };

  const totalMembers = delegatesQueryData?.pagination?.total;
  const entityLabel = totalMembers === 1 ? "Delegate" : "Delegates";
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;

  const emptyFilteredState = {
    heading: "No delegates found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      onclick: () => resetFilters(),
    },
  };

  const emptyState = {
    heading: "No delegates found",
    description: "Create your delegate profile",
    primaryButton: {
      label: "Announce delegation",
      onClick: onAnnounceDelegation,
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

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={totalMembers}
      pageSize={DEFAULT_PAGE_SIZE}
      state={dataListState}
      onLoadMore={fetchNextPage}
    >
      <DataList.Filter
        onSearchValueChange={setSearchValue}
        searchValue={searchValue}
        placeholder="Search by name or address"
        onSortChange={setActiveSort}
        activeSort={activeSort}
        sortItems={sortItems}
      />
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {delegatesQueryData?.delegates?.map((delegate) => (
          <MemberDataListItem.Structure
            votingPower={delegate.votingPower}
            address={delegate.address}
            // isDelegate={} // check if is delegate
            delegationCount={delegate.delegationCount}
            href={MemberProfile.getPath(delegate.address)}
            key={delegate.address}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
