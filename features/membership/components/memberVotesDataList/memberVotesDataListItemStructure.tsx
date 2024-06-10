import { DataListItem, Tag, type TagVariant, type IDataListItemProps } from "@aragon/ods";
import classNames from "classnames";
import type React from "react";

interface IMemberVotesDataListItemStructureProps extends IDataListItemProps {
  proposalId: string;
  proposalTitle: string;
  createdAt: string;
  votingOption: VotingOption;
}

export const MemberVotesDataListItemStructure: React.FC<IMemberVotesDataListItemStructureProps> = (props) => {
  const { className, createdAt, proposalId, proposalTitle, votingOption, ...otherProps } = props;

  return (
    <DataListItem className={classNames("flex flex-col gap-y-1 md:gap-y-1.5", className)} {...otherProps}>
      <div className="flex min-w-0 gap-x-2">
        <span className="flex shrink-0 leading-tight text-neutral-500 md:text-lg">{proposalId}</span>
        <span className="flex truncate leading-tight text-neutral-800 md:text-lg">{proposalTitle}</span>
      </div>
      <div className="flex gap-x-3 md:gap-x-4">
        <VoteOption votingOption={votingOption} />
        <span className="text-sm leading-tight text-neutral-500 md:text-base">{createdAt}</span>
      </div>
    </DataListItem>
  );
};

export type VotingOption = "yes" | "no" | "abstain" | "approve";

interface IVoteOptionProps {
  votingOption: VotingOption;
}

export const VoteOption: React.FC<IVoteOptionProps> = (props) => {
  const { votingOption } = props;

  const votingOptionToTagVariant: Record<VotingOption, TagVariant> = {
    yes: "success",
    no: "critical",
    abstain: "neutral",
    approve: "primary",
  };

  return (
    <div className="flex gap-x-2">
      <span className="text-sm leading-tight text-neutral-500 md:text-base">Voted</span>
      <Tag label={votingOption} className="capitalize" variant={votingOptionToTagVariant[votingOption]} />
    </div>
  );
};
