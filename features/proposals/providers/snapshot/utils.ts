import { PUB_CHAIN, SNAPSHOT_API_URL } from "@/constants";
import { ProposalStages } from "../../services";
import { type ProposalStage, type VotingData, type VotingScores } from "../utils/types";
import { type SnapshotProposalData } from "./types";

const computeStatus = (proposalState: string, scores: VotingScores[]): string => {
  switch (proposalState) {
    case "active":
      return "active";
    case "closed":
      return evaluateVotingResult(scores);
    case "pending":
      return "pending";
    case "cancelled":
      return "rejected";
    default:
      return "active";
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
  return data.map((proposal) => {
    const scores: VotingScores[] = proposal.scores.map((score, index) => {
      return {
        choice: proposal.choices[index],
        votes: score,
        percentage: (score / proposal.scores_total) * 100,
      };
    });

    const voting: VotingData = {
      startDate: proposal.start.toString(),
      endDate: proposal.end.toString(),
      choices: proposal.choices,
      snapshotBlock: proposal.snapshot,
      quorum: proposal.quorum,
      scores,
      total_votes: proposal.votes,
    };

    const creator = [
      {
        link: `${PUB_CHAIN.blockExplorers?.default.url}/address/${proposal.author}`,
        address: proposal.author,
      },
    ];

    return {
      id: ProposalStages.COMMUNITY_VOTING,
      title: proposal.title,
      description: proposal.title,
      body: proposal.body,
      status: computeStatus(proposal.state, scores),
      creator,
      link: proposal.link,
      voting,
    };
  });
}

// Function to evaluate the result based on votes
function evaluateVotingResult(votingData: VotingScores[]): string {
  let yesVotes = 0;
  let noVotes = 0;

  // Loop through the array to count votes for 'Yes' and 'No'
  for (const vote of votingData) {
    if (vote.choice.toLowerCase() === "accept") {
      yesVotes += vote.votes;
    } else if (vote.choice.toLowerCase() === "reject") {
      noVotes += vote.votes;
    }
  }

  // Determine the result based on the counts
  // update with proper calculation
  return yesVotes > noVotes ? "accepted" : "rejected";
}
