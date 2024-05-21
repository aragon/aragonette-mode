import { type IApprovalThresholdResult, Button } from "@aragon/ods";
import { ApprovalThresholdResult } from "./approvalThresholdResult";

export interface IVotingBreakdownProps {
  result: IApprovalThresholdResult;
  accountVoted: boolean;
}

export const VotingBreakdown: React.FC<IVotingBreakdownProps> = (props) => {
  const { result, accountVoted: approved } = props;

  return (
    <div className="flex flex-col gap-y-4">
      <ApprovalThresholdResult {...result} />
      {/* Button */}
      <span>
        <Button size="md" className="!rounded-full" disabled={approved}>
          {approved ? "Approved" : "Approve PIP"}
        </Button>
      </span>
    </div>
  );
};
