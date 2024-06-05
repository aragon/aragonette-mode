import { MemberProfile } from "@/components/nav/routes";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { councilMemberList } from "../../services/members/query-options";

const DEFAULT_PAGE_SIZE = 12;

export const CouncilMemberList: React.FC = () => {
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
  const entityLabel = totalMembers === 1 ? "Council member" : "Council members";
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;

  const emptyFilteredState = {
    heading: "No Council members found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      //   onclick: () => resetFilters(),
    },
  };

  const errorState = {
    heading: "Error loading the Council members",
    description: "There was an error loading the Council members. Please try again!",
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
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        emptyFilteredState={emptyFilteredState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {councilMemberListData?.members?.map((member) => (
          <MemberDataListItem.Structure key={member.address} href={MemberProfile.getPath(member.address)} {...member} />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
