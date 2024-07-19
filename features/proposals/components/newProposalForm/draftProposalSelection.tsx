import { Button, IconType, RadioCard, RadioGroup } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";
import { proposalList } from "../../services";
import { FormItem } from "./formItem";
import { type ICreateProposalMetadataFormData } from "./types";
import { ProposalSortDir } from "@/server/models/proposals";

const DEFAULT_PAGE_SIZE = 3;

interface IDraftProposalSelection {
  onPIPSelected: (pipMetadata: ICreateProposalMetadataFormData) => void;
}

// TODO: Add loading state and status
export const DraftProposalSelection: React.FC<IDraftProposalSelection> = ({ onPIPSelected }) => {
  const {
    data: draftProposalsData,
    isFetched,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    ...proposalList({ limit: DEFAULT_PAGE_SIZE, sortDir: ProposalSortDir.Asc, status: "pending" }),
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

  const showLoadMore = isFetched && (draftProposalsData?.pagination.total ?? 0) > DEFAULT_PAGE_SIZE;

  return (
    <div className="flex flex-col gap-y-4">
      <FormItem
        id="github-proposal"
        label="Select Github proposal"
        helpText="Define which proposal should be published onchain and ready to vote on."
      >
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
      </FormItem>
      {showLoadMore && hasNextPage && (
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
