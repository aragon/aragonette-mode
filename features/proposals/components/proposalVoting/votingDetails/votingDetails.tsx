import { DefinitionList, DefinitionListItem } from "@/components/definitionList/definitionList";
import { Heading, IconType, Link } from "@aragon/ods";

export interface IVotingDetailsProps {
  startDate: string;
  endDate: string;
  snapshotBlock: string;
  snapshotBlockURL: string;
  options: string;
  strategy: string;
}

export const VotingDetails: React.FC<IVotingDetailsProps> = (props) => {
  const { startDate, endDate, snapshotBlockURL, snapshotBlock, options, strategy } = props;
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-4 border-b border-b-neutral-100">
        <Heading size="h4">Voting</Heading>
        <DefinitionList>
          <DefinitionListItem term="Starts">{startDate}</DefinitionListItem>
          <DefinitionListItem term="Expires">{endDate}</DefinitionListItem>
          <DefinitionListItem term="Census Snapshot">
            <Link iconRight={IconType.LINK_EXTERNAL} href={snapshotBlockURL} target="_blank">
              {snapshotBlock}
            </Link>
          </DefinitionListItem>
        </DefinitionList>
      </div>
      <div className="flex flex-col gap-y-4">
        <Heading size="h4">Governance Settings</Heading>
        <DefinitionList>
          <DefinitionListItem term="Strategy">{strategy}</DefinitionListItem>
          <DefinitionListItem term="Voting options">
            <span>{options}</span>
          </DefinitionListItem>
        </DefinitionList>
      </div>
    </div>
  );
};
