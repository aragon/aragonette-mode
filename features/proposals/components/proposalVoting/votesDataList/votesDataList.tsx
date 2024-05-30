import { MemberProfile } from "@/components/nav/routes";
import { type ProposalStages } from "@/features/proposals";
import { proposalVotes } from "@/features/proposals/services/proposal";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, type DataListState } from "@aragon/ods";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isAddressEqual } from "viem";
import { useAccount } from "wagmi";
import { VotesDataListItemSkeleton } from "./votesDataListItemSkeleton";
import { VotesDataListItemStructure } from "./votesDataListItemStructure";

const DEFAULT_PAGE_SIZE = 6;

interface IVotesDataListProps {
  proposalId: string;
  stageTitle: string;
}

export const VotesDataList: React.FC<IVotesDataListProps> = (props) => {
  const { proposalId, stageTitle: stage } = props;
  const { address } = useAccount();

  const {
    data,
    isError,
    isLoading,
    isRefetching,
    isRefetchError,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
  } = useInfiniteQuery({
    ...proposalVotes({ proposalId, stage: stage as ProposalStages }),
    placeholderData: keepPreviousData,
  });

  const loading = isLoading || (isError && isRefetching);
  const error = isError && !isRefetchError && !isFetchNextPageError;
  const [dataListState, setDataListState] = useState<DataListState>(() =>
    generateDataListState(loading, error, isFetchingNextPage)
  );

  useEffect(() => {
    setDataListState(generateDataListState(loading, isError, isFetchingNextPage));
  }, [isError, isFetchingNextPage, loading]);

  const totalVotes = data?.pagination?.total;
  const showPagination = (totalVotes ?? 0) > DEFAULT_PAGE_SIZE;
  const entityLabel = totalVotes === 1 ? "Vote" : "Votes";

  const emptyFilteredState = {
    heading: "No votes found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
    },
  };

  const emptyState = {
    heading: "No votes cast",
  };

  const errorState = {
    heading: "Error loading votes",
    description: "There was an error loading the votes. Try again!",
    secondaryButton: {
      label: "Reload votes",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={totalVotes}
      pageSize={DEFAULT_PAGE_SIZE}
      state={dataListState}
      onLoadMore={fetchNextPage}
    >
      <DataList.Container
        SkeletonElement={VotesDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
      >
        {data?.votes?.map(({ id, choice, ...otherProps }) => (
          <VotesDataListItemStructure
            {...otherProps}
            variant={choice}
            connectedAccount={address && isAddressEqual(address, otherProps.address)}
            key={id}
            href={MemberProfile.getPath(otherProps.address)}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
