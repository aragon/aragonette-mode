import { type IFetchSnapshotVotingActivity } from "./params";

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
