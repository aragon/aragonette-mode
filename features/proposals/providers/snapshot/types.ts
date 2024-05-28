export type SnapshotProposalData = {
  id: string;
  title: string;
  body: string;
  choices: string[];
  created: number;
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
  scores_total: number;
  votes: number;
};

export type SnapshotVoteData = {
  id: string;
  voter: string;
  created: number;
  choice: number;
  vp: string;
  vp_state: string;
  reason: string;
};
