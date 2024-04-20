const snapshotGraphQLQuery = `
  query Proposals {
    proposals(first: 20, skip: 0, where: {space: "balancer.eth"}, orderBy: "created", orderDirection: desc) {
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
      space {
        id
      }
      scores
      votes
    }
  }
`;

export type ProposalSnapshotData = {
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
  space: {
    id: string;
  };
  scores: number[];
  votes: number;
};

export function getSnapshotData() {
  return fetch("https://hub.snapshot.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: snapshotGraphQLQuery }),
  })
    .then((response) => response.json())
    .then((res) => {
      return res.data.proposals as ProposalSnapshotData[];
    });
}
