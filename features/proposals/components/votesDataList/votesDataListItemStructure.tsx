import { formatHexString } from "@/utils/evm";
import { DataListItem, MemberAvatar, Tag, type IDataListItemProps, type TagVariant } from "@aragon/ods";
import classNames from "classnames";

export type IVoteChoice = "yes" | "approve" | "no" | "reject" | "abstain" | "veto";

export interface IVotesDataListItemStructureProps extends IDataListItemProps {
  address: string;
  choice: IVoteChoice;
  ensAvatar?: string;
  ensName?: string;
  votingPower?: string;
}

export const VotesDataListItemStructure: React.FC<IVotesDataListItemStructureProps> = (props) => {
  const { address, ensAvatar, ensName, choice, className, votingPower, ...otherProps } = props;

  let tagVariant: TagVariant = "neutral";

  switch (choice.toLowerCase()) {
    case "approve":
    case "yes":
      tagVariant = "success";
      break;
    case "no":
    case "reject":
      tagVariant = "critical";
      break;
  }

  return (
    <DataListItem className={classNames("flex flex-col gap-y-3 py-4 md:py-6", className)} {...otherProps}>
      <div className="flex gap-x-5">
        <MemberAvatar src={ensAvatar ?? ""} address={address} alt="Profile picture" className="shrink-0" />
        <div className="flex flex-1 flex-row-reverse items-center">
          <Tag label={choice} variant={tagVariant} className="capitalize" />
        </div>
      </div>
      <span className="text-lg leading-tight text-neutral-800 md:text-xl">{ensName || formatHexString(address)}</span>
      {votingPower && (
        <div className="flex items-center gap-x-1.5">
          <span className="text-neutral-800">{votingPower}</span>
          <span className="leading-tight text-neutral-500">Voting Power</span>
        </div>
      )}
    </DataListItem>
  );
};
