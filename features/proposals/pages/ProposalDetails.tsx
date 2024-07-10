import { MainSection } from "@/components/layout/mainSection";
import { useProposalApproval } from "@/plugins/multisig/hooks/useProposalApproval";
import { useProposalConfirmation } from "@/plugins/multisig/hooks/useProposalConfirmation";
import { useAdvanceToNextStage } from "@/plugins/multisig/hooks/useStartProposalDelay";
import { useUserCanApprove } from "@/plugins/multisig/hooks/useUserCanApprove";
import { useUserCanConfirm } from "@/plugins/multisig/hooks/useUserCanConfirm";
import { useCastSnapshotVote } from "@/plugins/snapshot/hooks/useCastSnapshotVote";
import { type SecondaryMetadata } from "@/services/rpc/multisig/types";
import { generateBreadcrumbs } from "@/utils/nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
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
import { ProposalStages, ProposalStatus, StageStatus, proposalKeys } from "../services";
import {
  canVote as canVoteQueryOptions,
  proposal as proposalQueryOptions,
  voted as votedQueryOptions,
} from "../services/query-options";

export const PENDING_PROPOSAL_POLLING_INTERVAL = 1000; // 1 sec
export const ACTIVE_PROPOSAL_POLLING_INTERVAL = 1000 * 60 * 5; // 5 mins

export default function ProposalDetails() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();

  // state variables
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [secondaryMetadata, setSecondaryMetadata] = useState<SecondaryMetadata>();

  // fetch proposal details
  const proposalId = router.query.id as string;
  const {
    data: proposal,
    refetch: refetchProposal,
    isSuccess: isProposalSuccess,
    fetchStatus: proposalFetchStatus,
    isRefetching: isRefetchingProposal,
    error,
  } = useQuery({
    ...proposalQueryOptions({ proposalId }),
    refetchInterval: (query) =>
      query.state.data?.status === ProposalStatus.ACTIVE ? ACTIVE_PROPOSAL_POLLING_INTERVAL : false,
  });

  // proposal id for current stage
  const proposalVoteId = proposal?.stages?.find((stage) => stage.type === proposal?.currentStage)?.providerId;

  /*************************************************
   *         Proposal Details Read Queries         *
   *************************************************/

  // check if user can vote on the proposal
  const { userCanApprove, queryKey: canApproveQueryKey } = useUserCanApprove(proposalVoteId);
  const { userCanConfirm, queryKey: canConfirmQueryKey } = useUserCanConfirm(proposalVoteId);
  const { data: userCanVote } = useQuery({
    ...canVoteQueryOptions({ address: address!, proposalId, stage: ProposalStages.COMMUNITY_VOTING }),
    enabled:
      !!address && !isRefetchingProposal && !!proposal && proposal?.currentStage === ProposalStages.COMMUNITY_VOTING,
  });

  // check if user has voted on the proposal
  const { data: userHasVoted } = useQuery({
    ...votedQueryOptions({ address: address!, proposalId, stage: proposal?.currentStage as ProposalStages }),
  });

  /*************************************************
   *              Query Invalidators               *
   *************************************************/
  // invalidates all the queries related to the proposal details
  const invalidateProposalDetailQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: proposalKeys?.proposal({ proposalId }),
      refetchType: "active",
    });
  }, [proposalId, queryClient]);

  // invalidates the queries checking if connected address can cast a vote
  const inValidateVotingEligibilityQueries = useCallback(() => {
    switch (proposal?.currentStage) {
      case ProposalStages.COUNCIL_APPROVAL:
        queryClient.invalidateQueries({ queryKey: canApproveQueryKey, refetchType: "all" });
        break;
      case ProposalStages.COUNCIL_CONFIRMATION:
        queryClient.invalidateQueries({ queryKey: canConfirmQueryKey, refetchType: "all" });
        break;
      case ProposalStages.COMMUNITY_VOTING:
        queryClient.invalidateQueries({
          queryKey: canVoteQueryOptions({
            address: address!,
            proposalId,
            stage: ProposalStages.COMMUNITY_VOTING,
          }).queryKey,
          refetchType: "all",
        });
        break;
    }
  }, [address, canApproveQueryKey, canConfirmQueryKey, proposal?.currentStage, proposalId, queryClient]);

  /*************************************************
   *         Proposal Details Write Queries        *
   *************************************************/
  // vote and approve proposal
  const {
    advanceToNextStage,
    isConfirmed: advancementConfirmed,
    isConfirming: confirmingNextStageAdvancement,
  } = useAdvanceToNextStage(proposalVoteId, secondaryMetadata, invalidateProposalDetailQueries);

  const { confirmProposal, isConfirming } = useProposalConfirmation(proposalVoteId, invalidateProposalDetailQueries);
  const { castVote, isConfirming: isVoting } = useCastSnapshotVote(proposalVoteId, invalidateProposalDetailQueries);
  const { approveProposal, isConfirming: isApproving } = useProposalApproval(
    proposalVoteId,
    secondaryMetadata ? advanceToNextStage : invalidateProposalDetailQueries
  );

  /*************************************************
   *           Synchronization Effects             *
   *************************************************/
  /**
   * Given the nature of stages needing to advance from "Pending" to "Active" or
   * "Active" to a resolution state, we need to poll the proposal status to determine
   * when to refetch the proposal data.
   *
   * When a proposal is pending, we poll to check if the current stage has started
   * by comparing the stage start date with the current datetime.
   *
   * When a proposal is active, we poll to check if the current stage has ended
   * by comparing the stage end date with the current datetime.
   *
   * When the proposal is no longer in an active state or pending state,
   * we clear the polling interval.
   */
  useEffect(() => {
    if (!proposal) return;

    const interval = setInterval(() => {
      const { details, status: currentStageStatus } =
        proposal.stages.find((stage) => stage.type === proposal.currentStage) ?? {};

      const currentStageStartDate = details?.startDate;
      const currentStageEndDate = details?.endDate;
      const now = dayjs();

      // proposal no longer pending or active, clear the polling interval
      if (proposal.status !== ProposalStatus.PENDING && proposal?.status !== ProposalStatus.ACTIVE) {
        clearInterval(interval);
        return;
      }

      // when current stage is pending but should start
      if (
        currentStageStatus === StageStatus.PENDING &&
        currentStageStartDate &&
        dayjs(currentStageStartDate).isBefore(now) &&
        !isRefetchingProposal
      ) {
        // cancelling shouldn't be needed, but adding to avoid infinite looping
        queryClient.cancelQueries({ queryKey: proposalQueryOptions({ proposalId }).queryKey });
        refetchProposal();
      }

      // when current stage is active but should end, refetch
      if (
        currentStageStatus === StageStatus.ACTIVE &&
        currentStageEndDate &&
        dayjs(currentStageEndDate).isBefore(now) &&
        !isRefetchingProposal
      ) {
        queryClient.cancelQueries({ queryKey: proposalQueryOptions({ proposalId }).queryKey });
        refetchProposal();
      }
    }, PENDING_PROPOSAL_POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [
    isRefetchingProposal,
    proposal,
    proposal?.currentStage,
    proposal?.stages,
    proposal?.status,
    proposalId,
    queryClient,
    refetchProposal,
  ]);

  // Once a proposal has been fetched, invalidate the voting eligibility queries
  // so that we get the latest data since the eligibility may have changed
  useEffect(() => {
    if (isProposalSuccess && proposalFetchStatus === "idle") {
      inValidateVotingEligibilityQueries();
    }
  }, [inValidateVotingEligibilityQueries, isProposalSuccess, proposalFetchStatus]);

  /**************************************************
   *            Callbacks and Handlers              *
   **************************************************/
  const isAdvancingToNextStage =
    confirmingNextStageAdvancement ||
    // transaction to advance is successful and proposal is being re-fetched
    (advancementConfirmed && isRefetchingProposal && proposal?.currentStage === ProposalStages.COUNCIL_APPROVAL);

  function getApprovalLabel(canAdvanceWithNextApproval: boolean) {
    if (isAdvancingToNextStage) {
      return "Advancing stage…";
    } else if (!isConnected) {
      return "Connect to approve";
    } else if (isApproving) {
      return "Approving…";
    } else if (userCanApprove && canAdvanceWithNextApproval) {
      return "Approve and advance";
    } else if (userHasVoted) {
      return "Approved";
    } else {
      return "Approve";
    }
  }

  function getConfirmationLabel() {
    if (isConfirming) {
      return "Confirming…";
    } else if (userHasVoted) {
      return "Confirmed";
    } else if (!isConnected) {
      return "Connect to confirm";
    } else {
      return "Confirm";
    }
  }

  function getVoteLabel() {
    if (isVoting) {
      return "Submitting vote…";
    } else if (userHasVoted) {
      return "Change vote";
    } else if (!isConnected) {
      return "Connect to vote";
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
                    isLoading: isApproving || isAdvancingToNextStage,
                    disabled: !isConnected || ((!!userHasVoted || !userCanApprove) && !isAdvancingToNextStage),
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

  /**************************************************
   *                     Render                     *
   **************************************************/
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
