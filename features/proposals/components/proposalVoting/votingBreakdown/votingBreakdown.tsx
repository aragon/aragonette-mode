import { Button, type IButtonProps } from "@aragon/ods";
import { BreakdownApprovalThresholdResult, type IBreakdownApprovalThresholdResult } from "./approvalThresholdResult";
import { BreakdownMajorityVotingResult } from "./majorityVotingResult";

export type ProposalType = "majorityVoting" | "approvalThreshold";

export type VotingCta = Pick<IButtonProps, "disabled" | "isLoading"> & {
  label?: string;
  onClick?: () => void;
};

export interface IBreakdownMajorityVotingResult {
  votingScores: { option: string; voteAmount: string; votePercentage: number; tokenSymbol: string }[];
}

export interface IVotingBreakdownProps<TType extends ProposalType = ProposalType> {
  variant: TType;
  result?: TType extends "approvalThreshold" ? IBreakdownApprovalThresholdResult : IBreakdownMajorityVotingResult;
  cta?: VotingCta;
}

export const VotingBreakdown: React.FC<IVotingBreakdownProps> = (props) => {
  const { result, cta, variant } = props;

  return (
    <div className="flex flex-col gap-y-4">
      {variant === "approvalThreshold" && !!result && (
        <BreakdownApprovalThresholdResult {...(result as IBreakdownApprovalThresholdResult)} />
      )}
      {variant === "majorityVoting" && !!result && (
        <BreakdownMajorityVotingResult {...(result as IBreakdownMajorityVotingResult)} />
      )}
      {/* Button */}
      {cta && (
        <span>
          <Button
            size="md"
            className="!rounded-full"
            disabled={cta.disabled}
            onClick={cta.onClick}
            isLoading={cta.isLoading}
          >
            {cta?.label}
          </Button>
        </span>
      )}
    </div>
  );
};
