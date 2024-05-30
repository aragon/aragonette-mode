export const snapshotProposalsQuery = (space: string) => `
  query Proposals {
    proposals(first: 20, skip: 0, where: {space: "${space}"}, orderBy: "created", orderDirection: desc) {
      id
      title
      body
      choices
      created
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

export const snapshotProposalQuery = (id: string) => `
  query Proposal {
    proposal(id: "${id}") {
      id
      title
      body
      choices
      created
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

export const snapshotVotingPowerQuery = (space: string, proposal: string, voter: string) => `
  query VotingPower {
    vp(space: "${space}", proposal: "${proposal}", voter: "${voter}") {
      vp
    }
  }
`;
