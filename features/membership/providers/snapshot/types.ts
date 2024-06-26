export type SnapshotVotingActivityQueryResponse = {
  votes: Array<{
    id: string;
    proposal: {
      id: string;
      choices: string[];
    };
    choice: string;
    created: string;
  }>;
};
