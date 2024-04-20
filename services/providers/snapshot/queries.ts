import { SNAPSHOT_API_URL } from "@/constants";

export const snapshotProposalsQuery = (space: string) => `
  query Proposals {
    proposals(first: 20, skip: 0, where: {space: "${space}"}, orderBy: "created", orderDirection: desc) {
      id
      title
      body
      choices
      start
      end
      quorum
      link
      snapshot
      state
      author
      app
      space {
        id
      }
      scores
      votes
    }
  }
`;

export type SnapshotProposalData = {
  id: string;
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  quorum: number;
  link: string;
  snapshot: string;
  state: string;
  author: string;
  app: string;
  space: {
    id: string;
  };
  scores: number[];
  votes: number;
};

export const snapshotVotesQuery = (proposal: string) => `
  query Votes {
    votes(first: 1000, where: {proposal: "${proposal}"}) {
      id
      voter
      created
      choice
      vp
      vp_state
      reason
    }
  }
`;

type SnapshotChoiceData = {
  [key: string]: number;
};

export type SnapshotVoteData = {
  id: string;
  voter: string;
  created: number;
  choice: SnapshotChoiceData;
  vp: string;
  vp_state: string;
  reason: string;
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
