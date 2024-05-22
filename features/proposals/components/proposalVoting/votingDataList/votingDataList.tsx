import { MemberProfile } from "@/components/nav/routes";
import { DataList, IconType, MemberDataListItemSkeleton, type DataListState } from "@aragon/ods";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { VotingDataListItemStructure } from "./votingDataListItemStructure";
import classNames from "classnames";
import { type ProposalStages } from "@/features/proposals";
import { proposalVotes } from "@/features/proposals/services/proposal";

const DEFAULT_PAGE_SIZE = 6;

interface IVotingDataListProps {
  proposalId: string;
  stageTitle: string;
}

export const VotingDataList: React.FC<IVotingDataListProps> = (props) => {
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
  const entityLabel = totalVoters === 1 ? "Voter" : "Voters";
  const showGrid = (!isError && !!(totalVoters && totalVoters > 1)) || isLoading; // add more when filtering is available

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
        SkeletonElement={MemberDataListItemSkeleton}
        errorState={errorState}
        emptyState={emptyState}
        emptyFilteredState={emptyFilteredState}
        className={classNames({
          "grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] content-center gap-3": showGrid,
        })}
      >
        {data?.votes?.map(({ id, ...otherProps }) => {
          return (
            // TODO: update with router agnostic ODS DataListItem
            <Link legacyBehavior={true} key={id} href={MemberProfile.getPath(otherProps.address)} passHref={true}>
              <VotingDataListItemStructure {...otherProps} />
            </Link>
          );
        })}
      </DataList.Container>
    </DataList.Root>
  );
};
