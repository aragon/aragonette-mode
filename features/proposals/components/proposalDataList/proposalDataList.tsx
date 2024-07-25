import { NewProposal, ProposalDetails } from "@/components/nav/routes";
import { ProposalDataListItemStructure } from "@/components/odsModified/proposalDataListItem";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, ProposalDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ProposalStages, StageOrder, proposalList, voted } from "../../services";
import { generateSortOptions, sortItems } from "./utils";
import { useRouter } from "next/navigation";

const DEFAULT_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MILLS = 500;

export const ProposalDataList: React.FC = () => {
  const { address } = useAccount();
  const router = useRouter();

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
    isFetchingNextPage,
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
              enabled: stage !== ProposalStages.DRAFT && stage != ProposalStages.TRANSPARENCY_REPORT && !!result,
            };
          })
        : [],
  });

  const isFiltered = searchValue != null && searchValue.trim().length > 0;
  const loading = (!isFiltered && activeSort == null && isLoading) || (isError && isRefetching);
  const [dataListState, setDataListState] = useState<DataListState>("initialLoading");

  useEffect(() => {
    const filtering = (!!debouncedQuery || !!activeSort) && isFetching && !isRefetching;
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage, filtering, isFiltered));
  }, [isError, isFetching, isFetchingNextPage, loading, isRefetching, isFiltered, debouncedQuery, activeSort]);

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
      onClick: () => resetFilters(),
    },
  };

  const emptyState = {
    heading: "No proposals found",
    description: "Start by creating a proposal",
    primaryButton: {
      label: "Create onchain PIP",
      iconLeft: IconType.PLUS,
      onClick: () => {
        router.push(NewProposal.path);
      },
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
          <ProposalDataListItemStructure
            {...proposal}
            voted={votedData[index]?.data}
            href={ProposalDetails.getPath(proposal.id)}
            key={proposal.id}
            className="!py-4 md:!py-6"
          />
        ))}
      </DataList.Container>
      {(totalProposals ?? 0) > DEFAULT_PAGE_SIZE && <DataList.Pagination />}
    </DataList.Root>
  );
};
