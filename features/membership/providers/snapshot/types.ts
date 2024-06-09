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

export type SnapshotVotingActivity = {
  id: string;
  choice: string;
  createdAt: string;
  proposalId: string;
};
