import { ProposalDetails } from "@/components/nav/routes";
import {
  DataList,
  IconType,
  ProposalDataListItem,
  ProposalDataListItemSkeleton,
  type DataListState,
} from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { proposalList } from "../../services/proposal";

const DEFAULT_PAGE_SIZE = 6;

export const ProposalDataList: React.FC = () => {
  const { data, isError, isFetchingNextPage, isLoading, refetch, fetchNextPage } = useInfiniteQuery({
    ...proposalList({ pageSize: DEFAULT_PAGE_SIZE }),
    // TODO: update cache time once data has been cached on the backend
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

  const totalProposals = data?.pages[0]?.length;
  const entityLabel = totalProposals === 1 ? "Proposal" : "Proposals";

  const emptyFilteredState = {
    heading: "No proposals found",
    description: "Your applied filters are not matching with any results. Reset and search with other filters!",
    secondaryButton: {
      label: "Reset all filters",
      iconLeft: IconType.RELOAD,
    },
  };

  const emptyState = {
    heading: "No proposals found",
    description: "Start by creating a proposal",
    primaryButton: {
      label: "Create onChain PIP",
      iconLeft: IconType.PLUS,
      onClick: () => alert("create proposal"),
    },
  };

  const errorState = {
    heading: "Error loading proposals",
    description: "There was an error loading the proposals. Try again!",
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
        emptyFilteredState={emptyFilteredState}
      >
        {data?.pages.flatMap((page) =>
          page.map((proposal) => (
            // TODO: update with router agnostic ODS DataListItem
            <Link legacyBehavior={true} key={proposal.id} href={ProposalDetails.getPath(proposal.id)} passHref={true}>
              <ProposalDataListItem.Structure {...proposal} />
            </Link>
          ))
        )}
      </DataList.Container>
      <DataList.Pagination />
    </DataList.Root>
  );
};
