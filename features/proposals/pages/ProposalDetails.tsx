import { MainSection } from "@/components/layout/mainSection";
import { generateBreadcrumbs } from "@/utils/nav";
import { Card } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { CardResources, HeaderProposal } from "../components";
import { proposal as proposalQueryOptions } from "../services/proposal/query-options";

const mockResources = [
  { name: "github", url: "https://github.com" },
  { name: "documentation", url: "https://docs.example.com" },
  { name: "demo", url: "https://demo.example.com" },
];

export default function ProposalDetails() {
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(router.asPath);

  const proposalId = (((router.query.id as string)?.split("-")[1] as unknown as number) - 1).toString() || "0";
  const { data: proposal, error } = useQuery(proposalQueryOptions({ proposalId }));

  if (proposal) {
    return (
      <>
        <HeaderProposal breadcrumbs={breadcrumbs} proposal={proposal} />
        <MainSection className="md:px-16 md:pb-20 md:pt-10">
          <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
            {/* Proposal */}
            <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
              <Card>Abstract</Card>
              <Card>Voting terminal</Card>
              <Card>Transparency report</Card>
              <Card>Actions</Card>
            </div>

            {/* Additional Information */}
            <div className="flex flex-col gap-y-6 md:w-[37%]">
              <CardResources resources={mockResources} />
              <Card>Card Status stub</Card>
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
