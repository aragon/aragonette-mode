import { MainSection } from "@/components/layout/mainSection";
import { useProposalApproval } from "@/plugins/multisig/hooks/useProposalApproval";
import { useUserCanApprove } from "@/plugins/multisig/hooks/useUserCanApprove";
import { generateBreadcrumbs } from "@/utils/nav";
import { Button, Card } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { BodySection, CardResources, HeaderProposal, ProposalAction, TransparencyReport } from "../components";
import { ProposalStages } from "../services";
import { proposal as proposalQueryOptions } from "../services/proposal/query-options";

export default function ProposalDetails() {
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(router.asPath);

  const proposalId = router.query.id as string;
  const { data: proposal, error } = useQuery(proposalQueryOptions({ proposalId }));

  // proposal id for current stage
  const proposalVoteId = proposal?.stages?.find(
    (stage) => stage.id === (proposal?.currentStage ?? ProposalStages.DRAFT)
  )?.voting?.providerId;

  // check if user can vote on a proposal the proposal
  const userCanApprove = useUserCanApprove(proposalVoteId);
  const { approveProposal, isConfirmed: isApproved } = useProposalApproval(proposalVoteId);

  if (proposal) {
    const isParentProposal = proposal.includedPips.length > 0;
    const showActions = proposal.actions.length > 0;
    const showVoting = true; // isParentProposal;
    const showIncludedPIPS = isParentProposal;

    return (
      <>
        <HeaderProposal breadcrumbs={breadcrumbs} proposal={proposal} />
        <MainSection className="md:px-16 md:pb-20 md:pt-10">
          <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
            {/* Proposal */}
            <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
              {proposal.body && <BodySection body={proposal.body} />}
              {showVoting && (
                <Card className="p-6 shadow-neutral">
                  <div className="flex flex-col gap-y-6">
                    <h3>Voting Terminal</h3>
                    <span>
                      <Button onClick={approveProposal} disabled={!userCanApprove}>
                        {isApproved ? "Approved" : "Approve"}
                      </Button>
                    </span>
                  </div>
                </Card>
              )}
              {proposal.transparencyReport && <TransparencyReport report={proposal.transparencyReport} />}
              {showActions && <ProposalAction actions={proposal.actions} />}
            </div>

            {/* Additional Information */}
            <div className="flex flex-col gap-y-6 md:w-[33%]">
              <CardResources resources={proposal.resources} title="Resources" />
              {showIncludedPIPS && <CardResources resources={proposal.includedPips} title="Included PIPs" />}
            </div>
          </div>
        </MainSection>
      </>
    );
  }

  if (error) {
    return `An error has occurred: ${error.message}`;
  }

  return "Loading...";
}
