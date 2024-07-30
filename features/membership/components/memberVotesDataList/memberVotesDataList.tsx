import { VotesDataListItemSkeleton } from "@/components/votesDataList/votesDataListItemSkeleton";
import { generateDataListState } from "@/utils/query";
import { DataList, IconType, type DataListState } from "@aragon/ods";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import { votingActivity } from "../../services/query-options";
import { MemberVotesDataListItemStructure, type VotingOption } from "./memberVotesDataListItemStructure";
import { ProposalDetails } from "@/components/nav/routes";
import { type ProposalStages } from "@/server/models/proposals/types";
dayjs.extend(relativeTime);

const DEFAULT_PAGE_SIZE = 3;

interface IMemberVotesDataListProps {
  address: string;
  stage: ProposalStages;
}

export const MemberVotesDataList: React.FC<IMemberVotesDataListProps> = (props) => {
  const { address, stage } = props;

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
    ...votingActivity({ address, stage }),
    enabled: !!address && !!stage,
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
        {data?.votes?.map((vote) => (
          <MemberVotesDataListItemStructure
            key={vote.id}
            createdAt={dayjs(vote.createdAt).fromNow()}
            proposalId={vote.proposal.id}
            proposalTitle={vote.proposal.title}
            votingOption={vote.choice as VotingOption}
            href={ProposalDetails.getPath(vote.proposal.id)}
          />
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
