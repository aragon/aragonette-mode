import { PUB_CHAIN } from "@/constants";
import { useDelegate } from "@/plugins/snapshotDelegation/hooks/useDelegate";
import { isAddressEqual } from "@/utils/evm";
import { DataList, MemberDataListItem } from "@aragon/ods";
import { useAccount } from "wagmi";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";
import { useDelegateDataList } from "./useDelegateDataList";

interface IDelegateDataListProps {
  onAnnounceDelegation: () => void;
}

export const DelegateDataList: React.FC<IDelegateDataListProps> = ({ onAnnounceDelegation }) => {
  const {
    state,
    pageSize,
    delegates,
    itemsCount,
    emptyState,
    errorState,
    entityLabel,
    searchValue,
    showPagination,
    handleLoadMore,
    containerClasses,
    emptyFilteredState,
    handleSearchValueChange,
  } = useDelegateDataList(onAnnounceDelegation);

  const { address } = useAccount();
  const { data: yourDelegate } = useDelegate(address);

  return (
    <DataList.Root
      state={state}
      pageSize={pageSize}
      itemsCount={itemsCount}
      onLoadMore={handleLoadMore}
      entityLabel={entityLabel}
    >
      <DataList.Filter
        searchValue={searchValue}
        placeholder="Filter by identifier or address"
        onSearchValueChange={handleSearchValueChange}
      />
      <DataList.Container
        errorState={errorState}
        emptyState={emptyState}
        SkeletonElement={MemberDataListItem.Skeleton}
        emptyFilteredState={emptyFilteredState}
        className={containerClasses}
      >
        {delegates.map((delegate) => (
          <MemberDataListItemStructure
            votingPower={delegate.votingPower}
            isDelegate={isAddressEqual(yourDelegate, delegate.address)}
            delegationCount={delegate.delegationCount}
            key={delegate.address}
            href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${delegate.address}`}
            name={delegate.name}
            address={delegate.address}
            target="_blank"
            rel="noopener"
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
