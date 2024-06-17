import { ProposalDetails } from "@/components/nav/routes";
import { proposalList } from "@/features/proposals/services/proposal/query-options";
import { generateDataListState } from "@/utils/query";
import {
  DataList,
  IconType,
  ProposalDataListItem,
  ProposalDataListItemSkeleton,
  type DataListState,
} from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 3;

export const ProposalsCreatedDataList: React.FC = () => {
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
    }),
  });

  const isFiltered = false;
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

  const totalProposals = proposalsQueryData?.pagination?.total;
  const entityLabel = totalProposals === 1 ? "Proposal" : "Proposals";

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
      <DataList.Container
        SkeletonElement={ProposalDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
      >
        {proposalsQueryData?.proposals?.map((proposal) => (
          <ProposalDataListItem.Structure {...proposal} href={ProposalDetails.getPath(proposal.id)} key={proposal.id} />
        ))}
      </DataList.Container>
      {(totalProposals ?? 0) > DEFAULT_PAGE_SIZE && <DataList.Pagination />}
    </DataList.Root>
  );
};
