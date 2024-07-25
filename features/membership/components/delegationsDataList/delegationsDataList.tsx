import { PUB_CHAIN, PUB_TOKEN_ADDRESS } from "@/constants";
import { useTokenInfo } from "@/plugins/erc20Votes/hooks/useTokenBalance";
import { DataList, MemberDataListItem } from "@aragon/ods";
import React from "react";
import { formatUnits } from "viem";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";
import { useDelegationsDataList } from "./useDelegationsDataList";

interface IDelegationsDataListProps {
  delegate: string;
}

export const DelegationsDataList: React.FC<IDelegationsDataListProps> = (props) => {
  const { delegate } = props;

  const {
    state,
    pageSize,
    errorState,
    itemsCount,
    emptyState,
    entityLabel,
    delegations,
    handleLoadMore,
    showPagination,
    containerClasses,
  } = useDelegationsDataList(delegate);

  // TODO: check decimals for staked balance value
  const { data: token } = useTokenInfo({ token: PUB_TOKEN_ADDRESS });
  const tokenDecimals = token?.[1] ?? 18;

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={itemsCount}
      pageSize={pageSize}
      state={state}
      onLoadMore={handleLoadMore}
    >
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        emptyState={emptyState}
        className={containerClasses}
      >
        {delegations.map((delegation) => (
          <MemberDataListItemStructure
            votingPower={Number(formatUnits(BigInt(delegation.votingPower ?? 0), tokenDecimals))}
            address={delegation.address}
            href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${delegation.address}`}
            target="_blank"
            rel="noopener"
            key={delegation.address}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
