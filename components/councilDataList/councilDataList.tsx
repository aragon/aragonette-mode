import { DataList, MemberDataListItem } from "@aragon/ods";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";
import { useCouncilDataList } from "./useCouncilDataList";
import { PUB_CHAIN } from "@/constants";

const blockExplorerEndpoint = `${PUB_CHAIN.blockExplorers?.default.url ?? "https://etherscan.io"}/address/`;
const profileExplorerURL = (address: string) => blockExplorerEndpoint + address;

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
            href={profileExplorerURL(member.address)}
            target="_blank"
            {...member}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
