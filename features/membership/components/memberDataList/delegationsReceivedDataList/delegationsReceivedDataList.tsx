import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { delegationsList } from "../../../services/members/query-options";
import { generateDataListState } from "../../../../../utils/query";

const DEFAULT_PAGE_SIZE = 3;

interface IDelegationsReceivedDataListProps {
  address: string;
}

export const DelegationsReceivedDataList: React.FC<IDelegationsReceivedDataListProps> = (props) => {
  const { address } = props;

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
    ...delegationsList({ address }),
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

  const totalVotes = data?.pagination?.total;
  const showPagination = (totalVotes ?? 0) > DEFAULT_PAGE_SIZE;
  const entityLabel = totalVotes === 1 ? "Delegation" : "Delegations";

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

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={totalVotes}
      pageSize={DEFAULT_PAGE_SIZE}
      state={dataListState}
      onLoadMore={fetchNextPage}
    >
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        emptyState={emptyState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {data?.members?.map((member) => <MemberDataListItem.Structure {...member} key={member.address} />)}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
