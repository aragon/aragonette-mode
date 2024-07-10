import { councilMemberList } from "@/features/membership/services/query-options";
import { generateDataListState } from "@/utils/query";
import { IconType, type DataListState } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useEffect, useState } from "react";

const DEFAULT_COUNCIL_MEMBERS_PAGE_SIZE = 12;

export const useCouncilDataList = () => {
  const { data, isError, isLoading, isFetching, isRefetching, isRefetchError, refetch } = useQuery({
    ...councilMemberList(),
  });

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, false, isFetching && !isRefetching)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, false, isFetching && !isRefetching));
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
  const showGrid = !(dataListState === "error" || (itemsCount != null && itemsCount === 0));
  const containerClasses = classNames({ "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3": showGrid });

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
