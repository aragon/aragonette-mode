import { MainSection } from "@/components/layout/mainSection";
import {
  AvatarIcon,
  Breadcrumbs,
  Heading,
  IconType,
  Tag,
  type IBreadcrumbsLink,
  type ProposalStatus,
  type TagVariant,
} from "@aragon/ods";
import { type IProposal } from "../../services/proposal";
import { Publisher } from "./publisher";

interface IHeaderProposalProps {
  breadcrumbs: IBreadcrumbsLink[];
  proposal: IProposal;
}

export const HeaderProposal: React.FC<IHeaderProposalProps> = (props) => {
  const {
    breadcrumbs,
    proposal: { status, title, isEmergency, description, publisher, type },
  } = props;

  const statusToTagVariant: Record<ProposalStatus, TagVariant> = {
    accepted: "success",
    active: "info",
    challenged: "warning",
    draft: "neutral",
    executed: "success",
    expired: "critical",
    failed: "critical",
    partiallyExecuted: "warning",
    pending: "neutral",
    queued: "success",
    rejected: "critical",
    vetoed: "warning",
  };

  return (
    <div className="flex w-full justify-center bg-neutral-0">
      {/* Wrapper */}
      <MainSection className="flex flex-col gap-y-6 md:px-16 md:pb-20 xl:px-16 xl:pb-20">
        <Breadcrumbs
          links={breadcrumbs}
          tag={
            status && {
              label: status,
              className: "capitalize",
              variant: statusToTagVariant[status],
            }
          }
        />
        {/* Title & description */}
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex w-full items-center gap-x-4">
            <Heading size="h1">{title}</Heading>
            <Tag label={type} variant="primary" />
            {isEmergency && <Tag label="Emergency" variant="critical" />}
          </div>
          <p className="text-lg leading-normal text-neutral-500">{description}</p>
        </div>
        {/* Metadata */}
        <div className="flex gap-x-10">
          <div className="flex gap-x-2">
            <AvatarIcon icon={IconType.CALENDAR} size="sm" variant="primary" />
            <div className="flex gap-x-0.5 text-base leading-tight ">
              <span className="text-neutral-500">Published at</span>
              <span className="text-neutral-800">{"2024-04-19"}</span>
            </div>
          </div>
          <div className="flex gap-x-2">
            <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
            <Publisher publisher={publisher} />
          </div>
          <div className="flex gap-x-2">
            <AvatarIcon icon={IconType.APP_MEMBERS} size="sm" variant="primary" />
            <div className="flex gap-x-0.5 text-base leading-tight ">
              <span className="text-neutral-800">4 weeks left</span>
              <span className="text-neutral-500">left until expiration</span>
            </div>
          </div>
        </div>
      </MainSection>
    </div>
  );
};
