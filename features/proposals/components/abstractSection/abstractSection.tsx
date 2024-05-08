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

interface IBodySectionProps {
  proposal: ProposalDetail;
}

export const BodySection: React.FC<IBodySectionProps> = (props) => {
  const {
    proposal: { body },
  } = props;

  return (
    <CardCollapsible
      buttonLabelClosed="Read full report"
      buttonLabelOpened="Read less"
      collapsedSize="md"
      onToggle={function noRefCheck() {}}
      className="flex w-full flex-col bg-neutral-0"
    >
      <Heading size="h2">Community PIP</Heading>
      <hr className="mt-4 rounded-full border-neutral-100" />
      <DocumentParser document={body} />
    </CardCollapsible>
  );
};
