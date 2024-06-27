import { type IFetchSnapshotVotingActivity } from "./params";

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

export const snapshotVotingPowerQuery = (space: string, voter: string, proposal?: string) =>
  proposal
    ? `
    query VotingPower {
      vp(space: "${space}", proposal: "${proposal}", voter: "${voter}") {
        vp
      }
    }`
    : `query VotingPower {
      vp(space: "${space}", voter: "${voter}") {
        vp
      }
    }`;

export const snapshotVotingActivityQuery = (params: IFetchSnapshotVotingActivity) => `
    query Votes {
      votes(
        first: 1000,
        where: {
          space: "${params.space}",
          voter: "${params.voter}"
        },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        proposal {
          id
          choices
        }
        choice
        created
      }
    }
    `;
