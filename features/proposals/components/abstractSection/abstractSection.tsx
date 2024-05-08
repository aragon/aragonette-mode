import { MainSection } from "@/components/layout/mainSection";
import {
  AvatarIcon,
  Breadcrumbs,
  CardCollapsible,
  DocumentParser,
  Heading,
  IconType,
  Tag,
  type IBreadcrumbsLink,
  type TagVariant,
} from "@aragon/ods";
import { type ProposalStatus } from "../../services/proposal/domain";
import { type ProposalDetail } from "../../services/proposal/selectors";

interface IAbstractSectionProps {
  proposal: ProposalDetail;
}

export const AbstractSection: React.FC<IHeaderProposalProps> = (props) => {
  const {
    proposal: { status, title, isEmergency, description, publisher, type, createdAt: startDate, endDate },
  } = props;
  console.log("Proposal: ", props);

  return (
    <CardCollapsible
      buttonLabelClosed="Read full report"
      buttonLabelOpened="Read less"
      collapsedSize="sm"
      onToggle={function noRefCheck() {}}
      className="flex w-full flex-col bg-neutral-0"
    >
      {/* Title & description */}
      <Heading size="h2">Community PIP</Heading>
      <hr className="mt-4 rounded-full border-neutral-100" />
      <DocumentParser document={description} />
    </CardCollapsible>
  );
};
