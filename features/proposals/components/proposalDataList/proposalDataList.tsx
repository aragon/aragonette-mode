import { ProposalDetails } from "@/components/nav/routes";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  DataList,
  IconType,
  ProposalDataListItem,
  ProposalDataListItemSkeleton,
  type DataListState,
} from "@aragon/ods";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ProposalStages, StageOrder, proposalList, voted } from "../../services/proposal";
import { generateDataListState, generateSortOptions, sortItems } from "./utils";

const DEFAULT_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MILLS = 500;

export const ProposalDataList: React.FC = () => {
  const { address } = useAccount();

  const [activeSort, setActiveSort] = useState<string>();
  const [searchValue, setSearchValue] = useState<string>();
  const [debouncedQuery, setDebouncedQuery] = useDebouncedValue<string | undefined>(
    searchValue?.trim()?.toLowerCase(),
    {
      delay: SEARCH_DEBOUNCE_MILLS,
    }
  );

  const {
    data: proposalsQueryData,
    isError,
    isLoading,
    isFetching,
    isRefetching,
    isRefetchError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    ...proposalList({
      limit: DEFAULT_PAGE_SIZE,
      ...(activeSort ? generateSortOptions(activeSort) : {}),
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
    }),
  });

  const votedData = useQueries({
    queries:
      proposalsQueryData && !!address
        ? proposalsQueryData.proposals.map(({ result, id: proposalId }) => {
            const stage = Object.keys(StageOrder)[Number(result?.stage?.id ?? 0)] as ProposalStages;
            return {
              ...voted({ proposalId, stage, address }),
              enabled: stage !== ProposalStages.DRAFT && !!result,
            };
          })
        : [],
  });

  const isFiltered = searchValue != null && searchValue.trim().length > 0;
  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage, isFetching && !isRefetching, isFiltered)
  );

  useEffect(() => {
    setDataListState(
      generateDataListState(loading, isError, isFetchingNextPage, isFetching && !isRefetching, isFiltered)
    );
  }, [isError, isFetching, isFetchingNextPage, isFiltered, loading, isRefetching]);

  useEffect(() => {
    if (!!debouncedQuery || !!activeSort) {
      setDataListState("loading");
    }
  }, [debouncedQuery, activeSort]);

  const resetFilters = () => {
    setSearchValue("");
    setDebouncedQuery("");
    setActiveSort("");
  };

  const totalProposals = proposalsQueryData?.pagination?.total;
  const entityLabel = totalProposals === 1 ? "Proposal" : "Proposals";

  const emptyFilteredState = {
    heading: "No proposals found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
      onclick: () => resetFilters(),
    },
  };

  const emptyState = {
    heading: "No proposals found",
    description: "Start by creating a proposal",
    primaryButton: {
      label: "Create onchain PIP",
      iconLeft: IconType.PLUS,
      onClick: () => alert("create proposal"),
    },
  };

  const errorState = {
    heading: "Error loading proposals",
    description: "There was an error loading the proposals. Please try again!",
    secondaryButton: {
      label: "Reload proposals",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={totalProposals}
      pageSize={DEFAULT_PAGE_SIZE}
      state={dataListState}
      onLoadMore={fetchNextPage}
    >
      <DataList.Filter
        onSearchValueChange={setSearchValue}
        searchValue={searchValue}
        placeholder="Search by title, proposal ID or publisher"
        onSortChange={setActiveSort}
        activeSort={activeSort}
        sortItems={sortItems}
      />
      <DataList.Container
        SkeletonElement={ProposalDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
      >
        {proposalsQueryData?.proposals?.map((proposal, index) => (
          <ProposalDataListItem.Structure
            {...proposal}
            voted={votedData[index]?.data}
            href={ProposalDetails.getPath(proposal.id)}
            key={proposal.id}
          />
        ))}
      </DataList.Container>
      {(totalProposals ?? 0) > DEFAULT_PAGE_SIZE && <DataList.Pagination />}
    </DataList.Root>
  );
};
