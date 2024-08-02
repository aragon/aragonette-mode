import { DataList, MemberDataListItem } from "@aragon/ods";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";
import { useCouncilDataList } from "./useCouncilDataList";

const etherscanURL = (address: string) => "https://etherscan.io/address/" + address;

export const CouncilDataList: React.FC = () => {
  const {
    pageSize,
    itemsCount,
    emptyState,
    errorState,
    entityLabel,
    dataListState,
    councilMembers,
    showPagination,
    containerClasses,
  } = useCouncilDataList();

  return (
    <DataList.Root entityLabel={entityLabel} itemsCount={itemsCount} pageSize={pageSize} state={dataListState}>
      <DataList.Container
        className={containerClasses}
        errorState={errorState}
        emptyState={emptyState}
        SkeletonElement={MemberDataListItem.Skeleton}
      >
        {councilMembers.map((member) => (
          <MemberDataListItemStructure
            key={member.address}
            href={etherscanURL(member.address)}
            target="_blank"
            {...member}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
