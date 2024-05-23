import { type IApprovalThresholdResult, Button } from "@aragon/ods";
import { ApprovalThresholdResult } from "./approvalThresholdResult";

export interface IVotingBreakdownCta {
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
}

export interface IVotingBreakdownProps {
  result: IApprovalThresholdResult;
  cta?: IVotingBreakdownCta;
}

export const VotingBreakdown: React.FC<IVotingBreakdownProps> = (props) => {
  const { result, cta } = props;

  return (
    <div className="flex flex-col gap-y-4">
      <ApprovalThresholdResult {...result} />
      {/* Button */}
      {cta && (
        <span>
          <Button size="md" className="!rounded-full" disabled={cta.disabled} onClick={cta.onClick}>
            {cta?.label}
          </Button>
        </span>
      )}
    </div>
  );
};
