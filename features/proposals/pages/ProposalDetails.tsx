import { MainSection } from "@/components/layout/mainSection";
import { generateBreadcrumbs } from "@/utils/nav";
import { Card } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { BodySection, CardResources, HeaderProposal, ProposalAction, TransparencyReport } from "../components";
import { proposal as proposalQueryOptions } from "../services/proposal/query-options";

export default function ProposalDetails() {
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(router.asPath);

  const { data: proposal, error } = useQuery(proposalQueryOptions({ proposalId: router.query.id as string }));

  if (proposal) {
    const showActions = (proposal.actions?.length ?? 0) > 0;
    const showVoting = false;
    const showIncludedPIPS = (proposal.includedPips?.length ?? 0) > 0;

    return (
      <>
        <HeaderProposal breadcrumbs={breadcrumbs} proposal={proposal} />
        <MainSection className="md:px-16 md:pb-20 md:pt-10">
          <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
            {/* Proposal */}
            <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
              {proposal.body && <BodySection body={proposal.body} />}
              {showVoting && <Card>Voting terminal</Card>}
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
