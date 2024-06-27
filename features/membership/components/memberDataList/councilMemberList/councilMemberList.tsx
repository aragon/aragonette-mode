import { PUB_CHAIN } from "@/constants";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, MemberDataListItem, type DataListState } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { councilMemberList } from "../../../services/query-options";
import { MemberDataListItemStructure } from "../memberDataListItemStructure/memberDataListItemStructure";

const DEFAULT_PAGE_SIZE = 12;

export const CouncilMemberList: React.FC = () => {
  const {
    data: councilMemberListData,
    isError,
    isLoading,
    isFetching,
    isRefetching,
    isRefetchError,
    refetch,
  } = useQuery({
    ...councilMemberList(),
  });

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, false, isFetching && !isRefetching, false)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, false, isFetching && !isRefetching, false));
  }, [isError, isFetching, loading, isRefetching]);

  const totalMembers = councilMemberListData?.length;
  const entityLabel = totalMembers === 1 ? "Protocol council member" : "Protocol council members";
  const showPagination = (totalMembers ?? 0) > DEFAULT_PAGE_SIZE;

  const errorState = {
    heading: "Error loading the Protocol council members",
    description: "There was an error loading the Protocol council members. Please try again!",
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
    >
      <DataList.Container
        SkeletonElement={MemberDataListItem.Skeleton}
        errorState={errorState}
        className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3"
      >
        {councilMemberListData?.map((member) => (
          <MemberDataListItemStructure
            key={member.address}
            href={`${PUB_CHAIN.blockExplorers?.default.url}/address/${member.address}`}
            target="_blank"
            rel="noopener"
            {...member}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
