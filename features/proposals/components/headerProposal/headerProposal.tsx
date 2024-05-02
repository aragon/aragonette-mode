import { MainSection } from "@/components/layout/mainSection";
import { AvatarIcon, Breadcrumbs, Heading, IconType, Tag, type IBreadcrumbsLink, type TagVariant } from "@aragon/ods";
import { type ProposalStatus } from "../../services/proposal/domain";
import { type ProposalDetail } from "../../services/proposal/selectors";
import { Publisher } from "./publisher";

interface IHeaderProposalProps {
  breadcrumbs: IBreadcrumbsLink[];
  proposal: ProposalDetail;
}

export const HeaderProposal: React.FC<IHeaderProposalProps> = (props) => {
  const {
    breadcrumbs,
    proposal: { status, title, isEmergency, description, publisher, type, createdAt: startDate, endDate },
  } = props;

  const showExpirationDate =
    !!endDate && (status === "active" || status === "pending" || status === "queued" || status === "vetoed");

  const tagVariant = getTagVariantFromStatus(status);

  return (
    <div className="flex w-full justify-center bg-neutral-0">
      {/* Wrapper */}
      <MainSection className="flex flex-col gap-y-6 md:px-16 md:py-10">
        <Breadcrumbs
          links={breadcrumbs}
          tag={
            status && {
              label: status,
              className: "capitalize",
              variant: tagVariant,
            }
          }
        />
        {/* Title & description */}
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex w-full items-center gap-x-4">
            <Heading size="h1">{title}</Heading>
            {type && <Tag label={type} variant="primary" />}
            {isEmergency && <Tag label="Emergency" variant="critical" />}
          </div>
          <p className="text-lg leading-normal text-neutral-500">{description}</p>
        </div>
        {/* Metadata */}
        <div className="flex gap-x-10">
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
            <Publisher publisher={publisher} />
          </div>
          {showExpirationDate && (
            <div className="flex items-center gap-x-2">
              <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
              <div className="flex gap-x-1 text-base leading-tight ">
                <span className="text-neutral-800">{endDate}</span>
                <span className="text-neutral-500">left until expiration</span>
              </div>
            </div>
          )}
        </div>
      </MainSection>
    </div>
  );
};

const getTagVariantFromStatus = (status: ProposalStatus): TagVariant => {
  switch (status) {
    case "accepted":
      return "success";
    case "active":
      return "info";
    case "challenged":
      return "warning";
    case "draft":
      return "neutral";
    case "executed":
      return "success";
    case "expired":
      return "critical";
    case "failed":
      return "critical";
    case "partiallyExecuted":
      return "warning";
    case "pending":
      return "neutral";
    case "queued":
      return "success";
    case "rejected":
      return "critical";
    case "vetoed":
      return "warning";
    default:
      return "neutral";
  }
};
