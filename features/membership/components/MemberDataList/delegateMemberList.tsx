import { MemberProfile } from "@/components/nav/routes";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { councilMemberList } from "../../services/members/query-options";

const DEFAULT_PAGE_SIZE = 12;

export const DelegateMemberList: React.FC = () => {
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
    }),
    select: (data) => ({
      delegates: data.pages.flatMap((p) => p.data),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
  });

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage, isFetching && !isRefetching, false)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage, isFetching && !isRefetching, false));
  }, [isError, isFetching, isFetchingNextPage, loading, isRefetching]);

  const totalMembers = councilMemberListData?.pagination?.total;
  const entityLabel = totalMembers === 1 ? "Delegate" : "Delegates";
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;

  const emptyFilteredState = {
    heading: "No delegates found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      //   onclick: () => resetFilters(),
    },
  };

  const emptyState = {
    heading: "No delegates found",
    description: "Create your delegate profile",
    // primaryButton: {
    //   label: "Create onchain PIP",
    //   iconLeft: IconType.PLUS,
    //   onClick: () => alert("create proposal"),
    // },
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
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {councilMemberListData?.delegates?.map((delegate) => (
          <MemberDataListItem.Structure
            {...delegate}
            href={MemberProfile.getPath(delegate.address)}
            key={delegate.address}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
