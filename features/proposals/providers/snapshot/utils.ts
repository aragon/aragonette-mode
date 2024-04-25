import { PUB_CHAIN, SNAPSHOT_API_URL } from "@/constants";
import { ProposalStages } from "../../services";
import { type ProposalStage, type VotingScores, type VotingData } from "../utils/types";
import { type SnapshotProposalData } from "./types";
import { type ProposalStatus } from "@aragon/ods";

const computeStatus = (proposalState: string): ProposalStatus => {
  switch (proposalState) {
    case "active":
      return "active";
    case "closed":
      return "rejected";
    case "pending":
      return "pending";
    case "approved":
      return "accepted";
    case "rejected":
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
      status: computeStatus(proposal.state),
      creator,
      link: proposal.link,
      voting,
    };
  });
}
