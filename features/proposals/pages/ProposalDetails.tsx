import { MainSection } from "@/components/layout/mainSection";
import { useProposalApproval } from "@/plugins/multisig/hooks/useProposalApproval";
import { useProposalConfirmation } from "@/plugins/multisig/hooks/useProposalConfirmation";
import { useUserCanApprove } from "@/plugins/multisig/hooks/useUserCanApprove";
import { useUserCanConfirm } from "@/plugins/multisig/hooks/useUserCanConfirm";
import { generateBreadcrumbs } from "@/utils/nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  BodySection,
  CardResources,
  HeaderProposal,
  ProposalAction,
  ProposalVoting,
  StageAdvancementDialog,
  TransparencyReport,
  type IBreakdownApprovalThresholdResult,
} from "../components";
import { ProposalStages, proposalKeys } from "../services";
import { proposal as proposalQueryOptions, voted as votedQueryOptions } from "../services/proposal/query-options";

export default function ProposalDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();

  // state variables
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [_, setCommunityProposalId] = useState<string>();

  // data queries
  const proposalId = router.query.id as string;
  const { data: proposal, error } = useQuery(proposalQueryOptions({ proposalId }));

  const { data: userHasVoted } = useQuery(
    votedQueryOptions({ address: address!, proposalId, stage: proposal?.currentStage as ProposalStages })
  );

  // proposal id for current stage
  const proposalVoteId = proposal?.stages?.find((stage) => stage.type === proposal?.currentStage)?.providerId;
  const userCanApprove = useUserCanApprove(proposalVoteId);
  const userCanConfirm = useUserCanConfirm(proposalVoteId);

  const { approveProposal, isConfirming: isApproving } = useProposalApproval(proposalVoteId, invalidateDetailQueries);
  const { confirmProposal, isConfirming } = useProposalConfirmation(proposalVoteId, invalidateDetailQueries);

  // invalidates all the queries related to the proposal details
  function invalidateDetailQueries() {
    queryClient.invalidateQueries({
      queryKey: proposalKeys.proposal({ proposalId }),
      refetchType: "all",
    });
  }

  function getApprovalLabel(canAdvanceWithNextApproval: boolean) {
    if (userHasVoted) {
      return "Approved";
    } else if (!isConnected) {
      return "Login to approve";
    } else if (isApproving) {
      return "Approving...";
    } else if (userCanApprove && canAdvanceWithNextApproval) {
      return "Approve and advance";
    } else {
      return "Approve";
    }
  }

  function getConfirmationLabel() {
    if (userHasVoted) {
      return "Confirmed";
    } else if (!isConnected) {
      return "Login to confirm";
    } else {
      return "Confirm";
    }
  }

  function handleApproveProposal(canAdvanceWithNextApproval: boolean) {
    if (canAdvanceWithNextApproval) {
      setShowAdvanceModal(true);
    } else {
      approveProposal();
    }
  }

  function augmentStages(canAdvanceWithNextApproval: boolean) {
    return proposal?.stages.map((stage) => {
      if (proposal.currentStage === ProposalStages.COUNCIL_APPROVAL) {
        return {
          ...stage,
          cta: {
            isLoading: isApproving,
            disabled: !!userHasVoted || isApproving || !userCanApprove || !isConnected,
            onClick: () => handleApproveProposal(canAdvanceWithNextApproval),
            label: getApprovalLabel(canAdvanceWithNextApproval),
          },
        };
      } else if (proposal.currentStage === ProposalStages.COMMUNITY_VOTING) {
        return {
          ...stage,
          cta: {
            disabled: !!userHasVoted || !userCanApprove,
            onClick: approveProposal,
            label: userHasVoted ? "Voted" : "Vote",
          },
        };
      } else {
        return {
          ...stage,
          cta: {
            isLoading: isConfirming,
            disabled: !!userHasVoted || isConfirming || !userCanConfirm || !isConnected,
            onClick: confirmProposal,
            label: getConfirmationLabel(),
          },
        };
      }
    });
  }

  if (proposal) {
    // intermediate values
    const breadcrumbs = generateBreadcrumbs(router.asPath);
    const isParentProposal = proposal.includedPips.length > 0;
    const showActions = proposal.actions.length > 0;
    const showVoting = true; // isParentProposal;
    const showIncludedPIPS = isParentProposal;

    // calculate whether proposal can advance with next approval
    let canAdvanceWithNextApproval = false;
    const isApprovalStage = proposal.currentStage === ProposalStages.COUNCIL_APPROVAL;
    const result = proposal.stages.find((stage) => stage.type === proposal.currentStage)?.result;

    if (result && isApprovalStage) {
      const { approvalAmount, approvalThreshold } = result as IBreakdownApprovalThresholdResult;
      if (approvalAmount + 1 === approvalThreshold) {
        canAdvanceWithNextApproval = true;
      }
    }

    const augmentedStages = augmentStages(canAdvanceWithNextApproval) ?? [];

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

        {/* Advance to community stage modal */}
        {showAdvanceModal && (
          <StageAdvancementDialog
            open={showAdvanceModal}
            onClose={() => setShowAdvanceModal(false)}
            onConfirm={setCommunityProposalId}
          />
        )}
      </>
    );
  }

  if (error) {
    return `An error has occurred: ${error.message}`;
  }

  return "Loading...";
}
