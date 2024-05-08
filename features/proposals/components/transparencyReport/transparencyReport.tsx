import { MainSection } from "@/components/layout/mainSection";
import {
  AvatarIcon,
  Breadcrumbs,
  Card,
  DocumentParser,
  Heading,
  IconType,
  Tag,
  type IBreadcrumbsLink,
  type TagVariant,
} from "@aragon/ods";
import { type ProposalStatus } from "../../services/proposal/domain";
import { type ProposalDetail } from "../../services/proposal/selectors";

interface ITransparencyReportProps {
  proposal: ProposalDetail;
}

export const TransparencyReport: React.FC<IHeaderProposalProps> = (props) => {
  const {
    proposal: { status, title, isEmergency, description, publisher, type, createdAt: startDate, endDate },
  } = props;
  console.log("Proposal: ", props);

  return (
    <Card className="flex w-full justify-center bg-neutral-0">
      {/* Wrapper */}
      <MainSection className="flex flex-col gap-y-6 md:px-16 md:py-10">
        {/* Title & description */}
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex w-full items-center gap-x-4">
            <Heading size="h1">Council Transparency Report</Heading>
          </div>
          <DocumentParser document={description} />
        </div>
        {/* Metadata */}
        <div className="flex flex-wrap gap-x-10 gap-y-2">
          {startDate && (
            <div className="flex items-center gap-x-2">
              <AvatarIcon icon={IconType.CALENDAR} size="sm" variant="primary" />
              <div className="flex gap-x-1 text-base leading-tight ">
                <span className="text-neutral-500">Published at</span>
                <span className="text-neutral-800">{startDate}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-x-2">
            <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
          </div>
        </div>
      </MainSection>
    </Card>
  );
};
