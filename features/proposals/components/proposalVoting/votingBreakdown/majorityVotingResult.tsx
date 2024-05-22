import { Progress } from "@aragon/ods";
import classNames from "classnames";

type Choices = "Yes" | "No" | "Abstain";
export interface IBreakdownMajorityVotingResult {
  votingScores: { option: string; voteAmount: string; votePercentage: number; tokenSymbol: string }[];
}

const choiceClassNames: Record<Choices, string> = {
  Yes: "*:bg-success-500",
  Abstain: "*:bg-neutral-400",
  No: "*:bg-critical-500",
};

const choiceTextClassNames: Record<Choices, string> = {
  Yes: "text-success-800",
  Abstain: "text-neutral-800",
  No: "text-critical-800",
};

export const BreakdownMajorityVotingResult: React.FC<IBreakdownMajorityVotingResult> = (props) => {
  const { votingScores } = props;

  return (
    <div className="flex flex-col gap-y-3 rounded-xl border border-neutral-100 p-3 shadow-neutral-sm md:flex-row md:gap-x-6 md:p-6">
      {votingScores.map((choice, index) => (
        <>
          <div key={choice.option} className="flex flex-1 flex-col gap-y-2 py-1 md:gap-y-3 md:py-0">
            <span className={classNames("leading-tight md:text-lg", choiceTextClassNames[choice.option as Choices])}>
              {choice.option}
            </span>
            <Progress value={choice.votePercentage} className={choiceClassNames[choice.option as Choices]} />
            <div className="flex gap-x-1">
              <span className="text-neutral-800">{choice.voteAmount}</span>
              <span className="text-neutral-500">{choice.tokenSymbol}</span>
            </div>
          </div>
          {index < votingScores.length - 1 && <div className="h-0.25 bg-neutral-100 md:h-auto md:w-0.25" />}
        </>
      ))}
    </div>
  );
};
