import { NewProposal, ProposalDetails, Proposals } from "@/components/nav/routes";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ProposalSortBy, ProposalSortDir } from "@/server/models/proposals";
import { generateDataListState } from "@/utils/query";
import { Button, DataList, IconType, ProposalDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ProposalStages, StageOrder, proposalList, voted, type IFetchProposalListParams } from "../../services";
import { generateSortOptions, sortItems } from "./utils";
import { ProposalDataListItemStructure } from "@/components/proposalDataListItem";

const DEFAULT_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MILLS = 500;

interface IProposalDataListProps extends IFetchProposalListParams {
  display?: "overview" | "list";
  pageSize?: number;
}

export const ProposalDataList: React.FC<IProposalDataListProps> = (props) => {
  const {
    display = "list",
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy = ProposalSortBy.CreatedAt,
    sortDir = ProposalSortDir.Desc,
    status,
  } = props;

  const { address } = useAccount();
  const router = useRouter();

  const [activeSort, setActiveSort] = useState<string | undefined>(`${sortBy}-${sortDir}`);
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
      limit: pageSize,
      ...(activeSort ? generateSortOptions(activeSort) : {}),
      ...(debouncedQuery ? { search: debouncedQuery } : {}),
      ...(status ? { status } : {}),
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
      className: "!rounded-full",
      iconLeft: IconType.RELOAD,
      onClick: () => resetFilters(),
    },
  };

  const emptyState = {
    heading: "No proposals found",
    description: "Start by creating a proposal",
    primaryButton: {
      label: "Create a proposal",
      iconLeft: IconType.PLUS,
      className: "!rounded-full",
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
      className: "!rounded-full",
      onClick: () => refetch(),
    },
  };

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={totalProposals}
      pageSize={pageSize}
      state={dataListState}
      onLoadMore={fetchNextPage}
    >
      {display === "list" && (
        <DataList.Filter
          onSearchValueChange={setSearchValue}
          searchValue={searchValue}
          placeholder="Search by title, proposal ID or publisher"
          onSortChange={setActiveSort}
          activeSort={activeSort}
          sortItems={sortItems}
        />
      )}
      <DataList.Container
        SkeletonElement={ProposalDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
      >
        {proposalsQueryData?.proposals?.map((proposal, index) => (
          <ProposalDataListItemStructure
            {...proposal}
            id=""
            voted={votedData[index]?.data}
            href={ProposalDetails.getPath(proposal.id)}
            key={proposal.id}
            className="!py-4 md:!py-6"
          />
        ))}
      </DataList.Container>
      {display === "list" && !isLoading && (totalProposals ?? 0) > pageSize && <DataList.Pagination />}
      {display === "overview" && (
        <span>
          <Button
            className="!rounded-full"
            variant="secondary"
            size="md"
            iconRight={IconType.CHEVRON_RIGHT}
            onClick={() => {
              router.push(Proposals.path);
            }}
          >
            View all
          </Button>
        </span>
      )}
    </DataList.Root>
  );
};
