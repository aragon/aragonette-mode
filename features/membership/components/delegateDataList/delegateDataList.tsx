import { MemberProfile } from "@/components/nav/routes";
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
    sortItems,
    delegates,
    itemsCount,
    activeSort,
    emptyState,
    errorState,
    entityLabel,
    searchValue,
    showPagination,
    handleLoadMore,
    containerClasses,
    handleSortChange,
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
        sortItems={sortItems}
        activeSort={activeSort}
        searchValue={searchValue}
        placeholder="Filter by identifier or address"
        onSortChange={handleSortChange}
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
            href={MemberProfile.getPath(delegate.address)}
            name={delegate.name}
            address={delegate.address}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
