export interface IFetchSnapshotVotingActivity {
  space: string;
  voter: string;
}

export interface IFetchSnapshotVotesParams {
  providerId: string;
}

export interface IFetchSnapshotVotingPowerParams {
  space: string;
  voter: string;
  providerId?: string;
}

export interface IFetchSnapshotProposalStagesParams {
  space: string;
}

export interface IFetchSnapshotProposalStageParams {
  providerId: string;
}
