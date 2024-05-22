import { MainSection } from "@/components/layout/mainSection";
import { useProposalApproval } from "@/plugins/multisig/hooks/useProposalApproval";
import { useProposalConfirmation } from "@/plugins/multisig/hooks/useProposalConfirmation";
import { useUserCanApprove } from "@/plugins/multisig/hooks/useUserCanApprove";
import { useUserCanConfirm } from "@/plugins/multisig/hooks/useUserCanConfirm";
import { generateBreadcrumbs } from "@/utils/nav";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { type Address } from "viem";
import { useAccount } from "wagmi";
import {
  BodySection,
  CardResources,
  HeaderProposal,
  ProposalAction,
  ProposalVoting,
  TransparencyReport,
} from "../components";
import { ProposalStages } from "../services";
import { proposal as proposalQueryOptions, voted } from "../services/proposal/query-options";

export default function ProposalDetails() {
  const { address } = useAccount();
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(router.asPath);

  const proposalId = router.query.id as string;
  const { data: proposal, error } = useQuery({
    ...proposalQueryOptions({ proposalId }),
    gcTime: Infinity,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: approved } = useQuery(
    voted({ address: address as Address, proposalId, stage: proposal?.currentStage as ProposalStages })
  );

  // proposal id for current stage
  const proposalVoteId = proposal?.stages?.find(
    (stage) => stage.type === (proposal?.currentStage ?? ProposalStages.DRAFT)
  )?.proposalId;

  // check if user can vote on a proposal the proposal
  const userCanApprove = useUserCanApprove(proposalVoteId);
  const userCanConfirm = useUserCanConfirm(proposalVoteId);

  const { approveProposal } = useProposalApproval(proposalVoteId);
  const { confirmProposal } = useProposalConfirmation(proposalVoteId);

  if (proposal) {
    const isParentProposal = proposal.includedPips?.length > 0;
    const showActions = proposal.actions.length > 0;
    const showVoting = true; // isParentProposal;
    const showIncludedPIPS = isParentProposal;

    const augmentedStages = proposal.stages.map((stage) => {
      if (proposal.currentStage === stage.id) {
        switch (stage.id) {
          case ProposalStages.COUNCIL_APPROVAL:
            return {
              ...stage,
              cta: {
                disabled: approved?.hasVoted ?? !userCanApprove,
                onClick: approveProposal,
                label: approved?.hasVoted ? "Approved" : "Approve PIP",
              },
            };
          // case ProposalStages.COMMUNITY_VOTING:
          //   return {
          //     ...stage,
          //     cta: {
          //       disabled: approved?.hasVoted ?? !userCanApprove,
          //       onClick: approveProposal,
          //       label: approved?.hasVoted ? "Voted" : "Cast vote",
          //     },
          //   };
          case ProposalStages.COUNCIL_CONFIRMATION:
            return {
              ...stage,
              cta: {
                disabled: approved?.hasVoted ?? !userCanConfirm,
                onClick: confirmProposal,
                label: approved?.hasVoted ? "Confirmed" : "Confirm PIP",
              },
            };
        }
      }

      return stage;
    });

    return (
      <>
        <HeaderProposal breadcrumbs={breadcrumbs} proposal={proposal} />
        <MainSection className="md:px-16 md:pb-20 md:pt-10">
          <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
            {/* Proposal */}
            <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
              {proposal.body && <BodySection body={proposal.body} />}
              {showVoting && <ProposalVoting stages={augmentedStages} />}
              {proposal.transparencyReport && <TransparencyReport report={proposal.transparencyReport} />}
              {showActions && <ProposalAction actions={proposal.actions} />}
            </div>

            {/* Additional Information */}
            <div className="flex flex-col gap-y-6 md:w-[33%]">
              <CardResources resources={proposal.resources} title="Resources" />
              {showIncludedPIPS && (
                <CardResources resources={proposal.includedPips} title="Included PIPs" displayLink={false} />
              )}
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
