import { ProposalSortDir, ProposalType } from "@/server/models/proposals";
import { Button, CardEmptyState, Icon, IconType, RadioCard, RadioGroup, StateSkeletonBar } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { proposalList, ProposalStatus } from "../../services";
import { FormItem } from "./formItem";
import { type ICreateProposalMetadataFormData } from "./types";

const DEFAULT_PAGE_SIZE = 3;

interface IDraftProposalSelection {
  onPIPSelected: (pipMetadata: ICreateProposalMetadataFormData) => void;
}

export const DraftProposalSelection: React.FC<IDraftProposalSelection> = ({ onPIPSelected }) => {
  const {
    data: draftProposalsData,
    isError,
    isLoading,
    isFetched,
    refetch,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    ...proposalList({
      limit: DEFAULT_PAGE_SIZE,
      sortDir: ProposalSortDir.Asc,
      status: ProposalStatus.PENDING,
      type: ProposalType.Parent,
    }),
    select: (data) => ({
      proposals: data.pages.flatMap((p) => p.data),
      pagination: { total: data.pages[0]?.pagination?.total ?? 0 },
    }),
  });

  const handlePIPSelected = (pipIndex: string) => {
    const index = Number(pipIndex);
    const pip = draftProposalsData?.proposals?.[index];

    if (!isNaN(index) && !!pip) {
      onPIPSelected({
        title: pip.title,
        summary: pip.description,
        description: pip.body,
        type: pip.type,
        resources: {
          github: pip.resources.find((r) => r.name.toLowerCase() === "github"),
          forum: pip.resources.find((r) => r.name.toLowerCase() === "forum"),
        },
      });
    }
  };

  const totalProposals = draftProposalsData?.pagination.total ?? 0;
  const showLoadMore = isFetched && totalProposals > DEFAULT_PAGE_SIZE && hasNextPage;
  const proposalsExist = isFetched && totalProposals > 0;
  const noPendingProposals = isFetched && !isLoading && totalProposals === 0;

  return (
    <div className="flex flex-col gap-y-4">
      <FormItem
        id="github-proposal"
        label="Select Github proposal"
        helpText="Define which proposal should be published onchain and ready to vote on."
      >
        {noPendingProposals && (
          <CardEmptyState
            heading="No draft PIPs have been found on Github. "
            description="Start by creating a PIP on Github"
            secondaryButton={{
              label: "Submit new PIP on Github",
              iconRight: IconType.LINK_EXTERNAL,
              className: "!rounded-full",
            }}
            objectIllustration={{ object: "MAGNIFYING_GLASS" }}
          />
        )}
        {isError && (
          <CardEmptyState
            heading="Error loading proposals"
            description="There was an error loading the proposals. Please try again!"
            secondaryButton={{
              label: "Reload proposals",
              iconLeft: IconType.RELOAD,
              onClick: () => {
                refetch();
              },
            }}
            objectIllustration={{ object: "ERROR" }}
          />
        )}
        {isLoading && (
          <div className="flex flex-col gap-y-3">
            {Array.from({ length: DEFAULT_PAGE_SIZE }, (_, i) => i + 1).map((i) => (
              <DraftProposalSkeleton key={i} />
            ))}
          </div>
        )}
        {proposalsExist && (
          <RadioGroup id="github-proposal" onValueChange={handlePIPSelected}>
            {draftProposalsData?.proposals.map((proposal, index) => (
              <RadioCard
                key={proposal.id}
                label={proposal.title}
                description={proposal.description}
                tag={{ label: proposal.id, variant: "primary" }}
                value={index.toString()}
              />
            ))}
          </RadioGroup>
        )}
      </FormItem>
      {showLoadMore && (
        <span>
          <Button
            size="md"
            variant="tertiary"
            className="!rounded-full"
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            iconRight={IconType.CHEVRON_DOWN}
          >
            Load more
          </Button>
        </span>
      )}
    </div>
  );
};

const DraftProposalSkeleton = () => {
  return (
    <div className="h-16 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 shadow-neutral-sm outline-none transition-all md:h-20 md:rounded-2xl md:px-6 md:py-4">
      <div className="flex h-full items-center gap-x-3 md:gap-x-4">
        <div className="flex flex-1 gap-x-0.5 md:gap-x-4">
          <div className="flex min-w-0 flex-1 flex-col gap-y-2 md:gap-y-2.5">
            <StateSkeletonBar size="sm" responsiveSize={{ md: "lg" }} width={"45%"} className="h-[17px]" />
            <StateSkeletonBar size="sm" responsiveSize={{ md: "lg" }} width={"80%"} className="h-[17px]" />
          </div>
          <StateSkeletonBar size="lg" width={"50px"} className="h-5" />
        </div>
        <span className="size-4 h-full">
          <Icon icon={IconType.RADIO} className="text-neutral-300 group-data-[state=checked]:hidden" />
        </span>
      </div>
    </div>
  );
};
