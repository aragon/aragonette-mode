import { MemberProfile } from "@/components/nav/routes";
import { DataList, MemberDataListItem } from "@aragon/ods";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";
import { useCouncilDataList } from "./useCouncilDataList";

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
          <MemberDataListItemStructure key={member.address} href={MemberProfile.getPath(member.address)} {...member} />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
