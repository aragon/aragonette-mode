import { MainSection } from "@/components/layout/mainSection";
import { useProposalApproval } from "@/plugins/multisig/hooks/useProposalApproval";
import { useProposalConfirmation } from "@/plugins/multisig/hooks/useProposalConfirmation";
import { useAdvanceToNextStage } from "@/plugins/multisig/hooks/useStartProposalDelay";
import { useUserCanApprove } from "@/plugins/multisig/hooks/useUserCanApprove";
import { useUserCanConfirm } from "@/plugins/multisig/hooks/useUserCanConfirm";
import { useCastSnapshotVote } from "@/plugins/snapshot/hooks/useCastSnapshotVote";
import { generateBreadcrumbs } from "@/utils/nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
import { type SecondaryMetadata } from "../providers/multisig/types";
import { ProposalStages, ProposalStatus, StageStatus, proposalKeys } from "../services";
import {
  canVote as canVoteQueryOptions,
  proposal as proposalQueryOptions,
  voted as votedQueryOptions,
} from "../services/proposal/query-options";

export const PENDING_PROPOSAL_STATUS_INTERVAL = 1000; // 1 sec
export const PROPOSAL_STATUS_INTERVAL = 1000 * 60 * 5; // 3 mins

export default function ProposalDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();

  // state variables
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [secondaryMetadata, setSecondaryMetadata] = useState<SecondaryMetadata>();

  // data queries
  const proposalId = router.query.id as string;
  const {
    data: proposal,
    refetch,
    isRefetching,
    error,
  } = useQuery({
    ...proposalQueryOptions({ proposalId }),
    refetchInterval: (query) => (query.state.data?.status === ProposalStatus.ACTIVE ? PROPOSAL_STATUS_INTERVAL : false),
  });

  const { data: userHasVoted } = useQuery({
    ...votedQueryOptions({ address: address!, proposalId, stage: proposal?.currentStage as ProposalStages }),
  });

  // proposal id for current stage
  const proposalVoteId = proposal?.stages?.find((stage) => stage.type === proposal?.currentStage)?.providerId;

  // check if user can vote on the proposal
  const userCanApprove = useUserCanApprove(proposalVoteId);
  const userCanConfirm = useUserCanConfirm(proposalVoteId);

  const { data: userCanVote } = useQuery({
    ...canVoteQueryOptions({ address: address!, proposalId, stage: ProposalStages.COMMUNITY_VOTING }),
    enabled: !!address && !isRefetching && !!proposal && proposal?.currentStage === ProposalStages.COMMUNITY_VOTING,
  });

  // vote and approve proposal
  const { advanceToNextStage, isConfirming: isAdvancingToNextStage } = useAdvanceToNextStage(
    proposalVoteId,
    secondaryMetadata,
    invalidateDetailQueries
  );

  const { castVote, isConfirming: isVoting } = useCastSnapshotVote(proposalVoteId, invalidateDetailQueries);
  const { confirmProposal, isConfirming } = useProposalConfirmation(proposalVoteId, invalidateDetailQueries);
  const { approveProposal, isConfirming: isApproving } = useProposalApproval(
    proposalVoteId,
    secondaryMetadata ? advanceToNextStage : invalidateDetailQueries
  );

  // invalidates all the queries related to the proposal details
  function invalidateDetailQueries() {
    queryClient.invalidateQueries({
      queryKey: proposalKeys?.proposal({ proposalId }),
      refetchType: "active",
    });
  }

  // // TODO: add proper invalidation for voting queries
  // useEffect(() => {
  //   function invalidateVotingQueries() {
  //     queryClient.invalidateQueries({
  //       queryKey: ["readContract"],
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: [{ functionName: "canApprove" }],
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: canVoteQueryOptions({ address: address!, proposalId, stage: ProposalStages.COMMUNITY_VOTING })
  //         .queryKey,
  //     });
  //   }

  //   if (isRefetching) {
  //     setTimeout(() => {
  //       invalidateVotingQueries();
  //     }, 1000 * 10);
  //   }
  // }, [address, isRefetching, proposalId, queryClient]);

  /**
   * Current stage has ended for an active proposal, refetch
   *
   */
  useEffect(() => {
    if (!proposal) return;

    const interval = setInterval(() => {
      const currentStage = proposal.stages.find((stage) => stage.type === proposal.currentStage);
      const currentStageEndDate = currentStage?.details?.endDate;
      const currentStageStartDate = currentStage?.details?.startDate;

      // proposal no longer pending or active, clear the interval
      if (proposal.status !== ProposalStatus.PENDING && proposal?.status !== ProposalStatus.ACTIVE) {
        clearInterval(interval);
      }

      // when current stage is pending and should start, refetch
      if (
        currentStage?.status === StageStatus.PENDING &&
        currentStageStartDate &&
        dayjs(currentStageStartDate).isBefore(dayjs()) &&
        !isRefetching
      ) {
        refetch();
      }

      // when current stage is active but should end, refetch
      if (
        currentStage?.status === StageStatus.ACTIVE &&
        currentStageEndDate &&
        dayjs(currentStageEndDate).isBefore(dayjs()) &&
        !isRefetching
      ) {
        refetch();
      }
    }, PENDING_PROPOSAL_STATUS_INTERVAL);

    return () => clearInterval(interval);
  }, [isRefetching, proposal, proposal?.currentStage, proposal?.stages, proposal?.status, refetch]);

  function getApprovalLabel(canAdvanceWithNextApproval: boolean) {
    if (userHasVoted) {
      return "Approved";
    } else if (!isConnected) {
      return "Login to approve";
    } else if (isApproving) {
      return "Approving...";
    } else if (isAdvancingToNextStage) {
      return "Advancing stage...";
    } else if (userCanApprove && canAdvanceWithNextApproval) {
      return "Approve and advance";
    } else {
      return "Approve";
    }
  }

  function getConfirmationLabel() {
    if (isConfirming) {
      return "Confirming...";
    } else if (userHasVoted) {
      return "Confirmed";
    } else if (!isConnected) {
      return "Login to confirm";
    } else {
      return "Confirm";
    }
  }

  function getVoteLabel() {
    if (isVoting) {
      return "Submitting vote...";
    } else if (userHasVoted) {
      return "Change vote";
    } else if (!isConnected) {
      return "Login to vote";
    } else {
      return "Vote";
    }
  }

  function handleApproveProposal(canAdvanceWithNextApproval: boolean) {
    if (canAdvanceWithNextApproval) {
      setShowAdvanceModal(true);
    } else {
      approveProposal();
    }
  }

  function handleConfirmSnapshotId(snapshotProposalUrl: string) {
    setSecondaryMetadata({ resources: [{ name: "Snapshot", url: snapshotProposalUrl }] });
    setShowAdvanceModal(false);
    approveProposal();
  }

  function augmentStages(canAdvanceWithNextApproval: boolean) {
    const now = dayjs();

    return proposal?.stages.flatMap((stage) => {
      const stageNotEnded = !!stage.details?.endDate && dayjs(stage.details.endDate).isAfter(now);

      switch (stage.type) {
        case ProposalStages.COUNCIL_APPROVAL:
          return {
            ...stage,
            cta:
              proposal.currentStage === ProposalStages.COUNCIL_APPROVAL && stageNotEnded
                ? {
                    isLoading: isApproving,
                    disabled: !isConnected || !!userHasVoted || !userCanApprove || isAdvancingToNextStage,
                    onClick: () => handleApproveProposal(canAdvanceWithNextApproval),
                    label: getApprovalLabel(canAdvanceWithNextApproval),
                  }
                : undefined,
          };
        case ProposalStages.COMMUNITY_VOTING:
          return {
            ...stage,
            cta:
              proposal.currentStage === ProposalStages.COMMUNITY_VOTING && stageNotEnded
                ? {
                    isLoading: isVoting,
                    disabled: !isConnected || !userCanVote,
                    onClick: castVote,
                    label: getVoteLabel(),
                  }
                : undefined,
          };
        case ProposalStages.COUNCIL_CONFIRMATION:
          return {
            ...stage,
            cta:
              proposal.currentStage === ProposalStages.COUNCIL_CONFIRMATION && stageNotEnded
                ? {
                    isLoading: isConfirming,
                    disabled: !isConnected || !!userHasVoted || !userCanConfirm,
                    onClick: confirmProposal,
                    label: getConfirmationLabel(),
                  }
                : undefined,
          };
        default:
          return [];
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

    if (result && isApprovalStage && !proposal.isEmergency) {
      const { approvalAmount, approvalThreshold } = result as IBreakdownApprovalThresholdResult;
      if (approvalAmount + 1 >= approvalThreshold) {
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
              {showVoting && <ProposalVoting stages={augmentedStages} isEmergency={!!proposal.isEmergency} />}
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
            onConfirm={handleConfirmSnapshotId}
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
