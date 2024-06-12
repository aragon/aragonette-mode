import { PUB_CHAIN, SNAPSHOT_API_URL } from "@/constants";
import { ProposalStages, ProposalStatus, StageStatus } from "../../services";
import { type ProposalStage, type VotingData, type VotingScores } from "../../models/proposals";
import { type SnapshotProposalData } from "./types";

const computeStatus = (proposalState: string, scores: VotingScores[]): [StageStatus, ProposalStatus] => {
  switch (proposalState) {
    case "active":
      return [StageStatus.ACTIVE, ProposalStatus.ACTIVE];
    case "closed":
      return evaluateVotingResult(scores);
    case "pending":
      return [StageStatus.PENDING, ProposalStatus.ACTIVE];
    default:
      return [StageStatus.PENDING, ProposalStatus.ACTIVE];
  }
};

export const requestProposalData = async function (query: string) {
  return fetch(SNAPSHOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());
};

export function parseSnapshotData(data: SnapshotProposalData[]): ProposalStage[] {
  return data.map((proposal) => parseSnapshotProposalData(proposal));
}

function parseChoice(choice: string): string {
  switch (choice.toLowerCase()) {
    case "accept":
    case "yes":
    case "approve":
    case "for":
    case "yay":
      return "approve";
    case "reject":
    case "no":
    case "deny":
    case "against":
    case "nay":
    case "veto":
      return "reject";
    default:
      return choice;
  }
}

export function parseSnapshotProposalData(proposal: SnapshotProposalData): ProposalStage {
  const choices = proposal.choices.map((choice) => parseChoice(choice));
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
      address: proposal.author,
    },
  ];

  return {
    stageType: ProposalStages.COMMUNITY_VOTING,
    title: proposal.title,
    description: proposal.title,
    body: proposal.body,
    status,
    overallStatus,
    createdAt: new Date(proposal.created * 1000),
    creator,
    voting,
    resources: [
      {
        name: "Snapshot",
        link: proposal.link,
      },
    ],
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
    if (choice === "approve") {
      yesVotes += vote.votes;
    } else if (choice === "reject") {
      noVotes += vote.votes;
    }
  }

  // Determine the result based on the counts
  // update with proper calculation
  return yesVotes > noVotes
    ? [StageStatus.APPROVED, ProposalStatus.ACTIVE]
    : [StageStatus.REJECTED, ProposalStatus.ACTIVE];
}
