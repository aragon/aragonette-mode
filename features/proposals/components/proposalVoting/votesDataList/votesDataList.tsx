import { MemberProfile } from "@/components/nav/routes";
import { type ProposalStages } from "@/features/proposals";
import { proposalVotes } from "@/features/proposals/services/proposal";
import { DataList, IconType, type DataListState } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { VotesDataListItemSkeleton } from "./votesDataListItemSkeleton";
import { VotesDataListItemStructure } from "./votesDataListItemStructure";
import { isAddressEqual } from "viem";
import { useAccount } from "wagmi";

const DEFAULT_PAGE_SIZE = 6;

interface IVotesDataListProps {
  proposalId: string;
  stageTitle: string;
}

export const VotingDataList: React.FC<IVotesDataListProps> = (props) => {
  const { proposalId, stageTitle: stage } = props;

  const { data, isError, isFetchingNextPage, isLoading, refetch, fetchNextPage } = useInfiniteQuery({
    ...proposalVotes({ proposalId, stage: stage as ProposalStages }),
    placeholderData: keepPreviousData,
    gcTime: Infinity,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  let dataListState: DataListState = "idle";
  if (isLoading) {
    dataListState = "initialLoading";
  } else if (isError) {
    dataListState = "error";
  } else if (isFetchingNextPage) {
    dataListState = "fetchingNextPage";
  }

  const totalVoters = data?.pagination?.total;
  const showPagination = (totalVoters ?? 0) > DEFAULT_PAGE_SIZE;
  const entityLabel = totalVoters === 1 ? "Voter" : "Voters";

  const emptyFilteredState = {
    heading: "No voters found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
    },
  };

  const emptyState = {
    heading: "No voters found",
    description: "Start by creating a voter",
    primaryButton: {
      label: "Create onChain PIP",
      iconLeft: IconType.PLUS,
      onClick: () => alert("create voter"),
    },
  };

  const errorState = {
    heading: "Error loading voters",
    description: "There was an error loading the voters. Try again!",
    secondaryButton: {
      label: "Reload voters",
      iconLeft: IconType.RELOAD,
      onClick: () => refetch(),
    },
  };

  return (
    <DataList.Root
      entityLabel={entityLabel}
      itemsCount={totalVoters}
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
          // TODO: update with router agnostic ODS DataListItem
          <Link legacyBehavior={true} key={id} href={MemberProfile.getPath(otherProps.address)} passHref={true}>
            <VotesDataListItemStructure
              {...otherProps}
              variant={choice}
              connectedAccount={address && isAddressEqual(address, otherProps.address)}
            />
          </Link>
        ))}
      </DataList.Container>
      {showPagination && <DataList.Pagination />}
    </DataList.Root>
  );
};
