import { MainSection } from "@/components/layout/mainSection";
import { PleaseWaitSpinner } from "@/components/please-wait";
import { NotFound } from "@/components/not-found";
import { useCastSnapshotVote } from "@/plugins/snapshot/hooks/useCastSnapshotVote";
import { generateBreadcrumbs } from "@/utils/nav";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { track } from "@vercel/analytics";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  BodySection,
  CardResources,
  HeaderProposal,
  ProposalAction,
  ProposalVoting,
  TransparencyReport,
} from "../components";
import { ProposalStages, ProposalStatus, StageStatus, proposalKeys } from "../services";
import {
  canVote as canVoteQueryOptions,
  proposalList,
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

    queryClient.invalidateQueries({
      queryKey: proposalList().queryKey,
      refetchType: "all",
    });
  }, [proposalId, queryClient]);

  // invalidates the queries checking if connected address can cast a vote
  const inValidateVotingEligibilityQueries = useCallback(() => {
    switch (proposal?.currentStage) {
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
  }, [address, proposal?.currentStage, proposalId, queryClient]);

  /*************************************************
   *         Proposal Details Write Queries        *
   *************************************************/

  const { castVote, isConfirming: isVoting } = useCastSnapshotVote(proposalVoteId, invalidateProposalDetailQueries);

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

  function augmentStages() {
    const now = dayjs();

    return proposal?.stages.flatMap((stage) => {
      const stageNotEnded = !!stage.details?.endDate && dayjs(stage.details.endDate).isAfter(now);

      switch (stage.type) {
        case ProposalStages.COMMUNITY_VOTING:
          return {
            ...stage,
            cta:
              proposal.currentStage === ProposalStages.COMMUNITY_VOTING && stageNotEnded
                ? {
                    isLoading: isVoting,
                    disabled: !isConnected || !userCanVote,
                    onClick: (choice: number, reason: string) => {
                      castVote(choice, reason).then(() => track("proposal_vote", { proposalId }));
                    },
                    label: getVoteLabel(),
                    alert:
                      isConnected && !userCanVote
                        ? "Connected wallet did not have voting power when the proposal was created"
                        : undefined,
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
    const showActions = proposal.actions.length > 0;

    const augmentedStages = augmentStages() ?? [];

    return (
      <>
        <HeaderProposal breadcrumbs={breadcrumbs} proposal={proposal} />
        <MainSection className="md:px-16 md:pb-20 md:pt-10">
          <div className="flex w-full flex-col gap-x-12 gap-y-6 md:flex-row">
            {/* Proposal */}
            <div className="flex flex-col gap-y-6 md:w-[63%] md:shrink-0">
              {proposal.body && <BodySection body={proposal.body} />}
              <ProposalVoting stages={augmentedStages} isEmergency={!!proposal.isEmergency} />
              {proposal.transparencyReport && <TransparencyReport report={proposal.transparencyReport} />}
              {showActions && <ProposalAction actions={proposal.actions} />}
            </div>

            {/* Additional Information */}
            <div className="flex flex-col gap-y-6 md:w-[33%]">
              <CardResources resources={proposal.resources} title="Resources" />
            </div>
          </div>
        </MainSection>
      </>
    );
  }

  if (error) {
    if (error.message === "Proposal not found") {
      return <NotFound title={error.message} message={"We couldn't find a proposal matching the given id."} />;
    }
    return (
      <NotFound title="Oh no! Something went wrong" message={"An unexpected error occurred. Please try again later."} />
    );
  }

  return <PleaseWaitSpinner />;
}
