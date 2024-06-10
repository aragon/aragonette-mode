import { PUB_CHAIN } from "@/constants";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, MemberDataListItem, useDebouncedValue, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { councilMemberList } from "../../../services/members/query-options";

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MILLS = 500;

export const CouncilMemberList: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>();
  const [debouncedQuery, setDebouncedQuery] = useDebouncedValue<string | undefined>(
    searchValue?.trim()?.toLowerCase(),
    {
      delay: SEARCH_DEBOUNCE_MILLS,
    }
  );

  const {
    data: councilMemberListData,
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
    ...councilMemberList({
      limit: DEFAULT_PAGE_SIZE,
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

  const resetFilters = () => {
    setSearchValue("");
    setDebouncedQuery("");
    // setActiveSort("");
  };

  const totalMembers = councilMemberListData?.pagination?.total;
  const entityLabel = totalMembers === 1 ? "Protocol council member" : "Protocol council members";
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;

  const emptyFilteredState = {
    heading: "No council members found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      onclick: () => resetFilters(),
    },
  };

  const errorState = {
    heading: "Error loading the Protocol council members",
    description: "There was an error loading the Protocol council members. Please try again!",
    secondaryButton: {
      label: "Reload members",
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
      />
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        emptyFilteredState={emptyFilteredState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {councilMemberListData?.members?.map((member) => (
          <MemberDataListItem.Structure
            key={member.address}
            href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${member.address}`}
            target="_blank"
            rel="noopener"
            {...member}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
