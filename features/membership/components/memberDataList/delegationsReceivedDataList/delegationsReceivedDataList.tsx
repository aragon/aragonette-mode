import { PUB_CHAIN, PUB_TOKEN_ADDRESS } from "@/constants";
import { useTokenInfo } from "@/plugins/erc20Votes/hooks/useTokenBalance";
import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { formatUnits, type Address } from "viem";
import { generateDataListState } from "../../../../../utils/query";
import { delegationsList } from "../../../services/members/query-options";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";
import classNames from "classnames";

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

  const { data: token } = useTokenInfo({ account: data?.members[0]?.address as Address, token: PUB_TOKEN_ADDRESS });
  const tokenDecimals = token?.[1] ?? 18;

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
        className={classNames({
          "grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3": !isError && (totalVotes ?? 0) > 0,
        })}
      >
        {data?.members?.map((member) => (
          <MemberDataListItemStructure
            votingPower={Number(formatUnits(BigInt(member.votingPower ?? 0), tokenDecimals))}
            address={member.address}
            href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${member.address}`}
            target="_blank"
            rel="noopener"
            key={member.address}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
