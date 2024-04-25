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
      scores_total
      votes
    }
  }
`;

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
