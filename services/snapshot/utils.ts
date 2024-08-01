import { PUB_CHAIN } from "@/constants";
import { ProposalStages, ProposalStatus, StageStatus } from "../../features/proposals/services";
import { type ProposalStage, type Vote, type VotingData, type VotingScores } from "../../server/models/proposals/types";
import { type SnapshotProposalData, type SnapshotVoteData } from "@/services/snapshot/types";

const computeStatus = (proposalState: string, scores: VotingScores[]): [StageStatus, ProposalStatus] => {
  switch (proposalState) {
    case "active":
      return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
    case "closed":
      return evaluateVotingResult(scores);
    case "pending":
      return [StageStatus.PENDING, ProposalStatus.PENDING];
    default:
      return [StageStatus.PENDING, ProposalStatus.PENDING];
  }
};

export function parseSnapshotData(data: SnapshotProposalData[]): ProposalStage[] {
  return data.map((proposal) => parseSnapshotProposalData(proposal));
}

export function parseSnapshotChoice(choice: string): string {
  switch (choice.toLowerCase()) {
    case "accept":
    case "yes":
    case "approve":
    case "for":
    case "yay":
      return "yes";
    case "reject":
    case "no":
    case "deny":
    case "against":
    case "nay":
    case "veto":
      return "no";
    default:
      return choice;
  }
}

export function parseSnapshotProposalData(proposal: SnapshotProposalData): ProposalStage {
  const choices = proposal.choices.map((choice) => parseSnapshotChoice(choice));
  const scores: VotingScores[] = proposal.scores.map((score, index) => {
    return {
      choice: choices[index],
      votes: score,
      percentage: (score / proposal.scores_total) * 100,
    };
  });

  const [status, overallStatus] = computeStatus(proposal.state, scores);

  const voting: VotingData = {
    providerId: proposal.id,
    startDate: new Date(proposal.start * 1000),
    endDate: new Date(proposal.end * 1000),
    choices,
    snapshotBlock: proposal.snapshot,
    quorum: proposal.quorum,
    scores,
    total_votes: proposal.votes,
    status,
    overallStatus,
  };

  const creator = [
    {
      link: `${PUB_CHAIN.blockExplorers?.default.url}/address/${proposal.author}`,
      name: proposal.author,
    },
  ];

  const resources = [
    {
      name: "Snapshot",
      link: proposal.link,
    },
  ];

  if (proposal.discussion?.startsWith("http")) {
    resources.push({
      name: "Discussion",
      link: proposal.discussion,
    });
  }

  return {
    mip: proposal.id,
    stageType: ProposalStages.COMMUNITY_VOTING,
    title: proposal.title,
    description: proposal.body,
    body: proposal.body,
    status,
    overallStatus,
    createdAt: new Date(proposal.created * 1000),
    creator,
    voting,
    resources,
    actions: [],
    bindings: [],
  };
}

// Function to evaluate the result based on votes
// TODO: update with proper veto calculation
function evaluateVotingResult(votingData: VotingScores[]): [StageStatus, ProposalStatus] {
  let yesVotes = 0;
  let noVotes = 0;

  // Loop through the array to count votes for 'Yes' and 'No'
  for (const vote of votingData) {
    const choice = vote.choice;
    if (choice === "yes") {
      yesVotes += vote.votes;
    } else if (choice === "no") {
      noVotes += vote.votes;
    }
  }

  // Determine the result based on the counts
  // update with proper calculation
  return yesVotes > noVotes
    ? [StageStatus.APPROVED, ProposalStatus.ACCEPTED]
    : [StageStatus.REJECTED, ProposalStatus.REJECTED];
}

export function parseSnapshotVoteData(data: SnapshotVoteData[]): Vote[] {
  return data.map((vote) => {
    return {
      id: vote.id,
      voter: vote.voter,
      choice: vote.proposal.choices[Number(vote.choice) - 1],
      amount: vote.vp,
      timestamp: new Date(Number(vote.created) * 1000).toISOString(),
      reason: vote.reason,
    };
  });
}
