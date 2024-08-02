import { councilMemberList } from "@/features/services/query-options";
import { generateDataListState } from "@/utils/query";
import { IconType, type DataListState } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useEffect, useState } from "react";

const DEFAULT_COUNCIL_MEMBERS_PAGE_SIZE = 12;

export const useCouncilDataList = () => {
  const { data, isError, isLoading, isFetching, isRefetching, refetch } = useQuery({
    ...councilMemberList(),
  });

  const loading = isLoading || (isError && isRefetching);
  const [dataListState, setDataListState] = useState<DataListState>("initialLoading");

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, false));
  }, [isError, isFetching, loading, isRefetching]);

  const errorState = {
    heading: "Error loading the Protocol council members",
    description: "There was an error loading the Protocol council members. Please try again!",
    secondaryButton: {
      label: "Reload members",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  const emptyState = {
    heading: "No council members found",
  };

  const itemsCount = data?.length;
  const entityLabel = itemsCount === 1 ? "Protocol council member" : "Protocol council members";
  const showPagination = (itemsCount ?? 0) > DEFAULT_COUNCIL_MEMBERS_PAGE_SIZE;
  const containerClasses = classNames({
    "grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-3": !(
      dataListState === "error" ||
      ((dataListState === "idle" || dataListState === "filtered") && itemsCount === 0)
    ),
  });

  return {
    entityLabel,
    itemsCount,
    dataListState,
    errorState,
    emptyState,
    councilMembers: data ?? [],
    showPagination,
    pageSize: DEFAULT_COUNCIL_MEMBERS_PAGE_SIZE,
    containerClasses,
  };
};
