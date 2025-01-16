import { object, string, number, array, boolean, type InferOutput, type InferInput } from "valibot";

export const BribeSchema = object({
  token: string(),
  symbol: string(),
  decimals: number(),
  value: number(),
  maxValue: number(),
  amount: number(),
  maxTokensPerVote: number(),
  briber: string(),
  periodIndex: number(),
  chainId: number(),
  refunds: number(),
  periodCount: number(),
});

export type Bribe = InferOutput<typeof BribeSchema>;

export const ProposalDatumSchema = object({
  proposal: string(),
  proposalHash: string(),
  title: string(),
  proposalDeadline: number(),
  totalValue: number(),
  maxTotalValue: number(),
  voteCount: number(),
  valuePerVote: number(),
  maxValuePerVote: number(),
  bribes: array(BribeSchema),
  efficiency: number(),
});

export type ProposalDatum = InferInput<typeof ProposalDatumSchema>;

export const ProposalSchema = object({
  error: boolean(),
  data: array(ProposalDatumSchema),
});

export type Proposal = InferInput<typeof ProposalSchema>;

export const ClaimMetadataSchema = object({
  identifier: string(),
  account: string(),
  amount: string(),
  merkleProof: array(string()),
});
export type ClaimMetadata = InferInput<typeof ClaimMetadataSchema>;

export const RewardDatumSchema = object({
  symbol: string(),
  name: string(),
  token: string(),
  decimals: number(),
  chainId: number(),
  protocol: string(),
  claimable: string(),
  cumulativeAmount: string(),
  value: number(),
  activeTimer: number(),
  pausedTimer: number(),
  claimMetadata: ClaimMetadataSchema,
});

export type RewardDatum = InferInput<typeof RewardDatumSchema>;

export const RewardSchema = object({
  error: boolean(),
  data: array(RewardDatumSchema),
});

export type Reward = InferInput<typeof RewardSchema>;
