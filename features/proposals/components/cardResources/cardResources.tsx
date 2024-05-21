import { Card, CardEmptyState, Heading, IconType, Link } from "@aragon/ods";
import React from "react";
import { type IProposalResource } from "../../services/proposal/domain";

interface ICardResourcesProps {
  displayLink?: boolean;
  resources?: IProposalResource[];
  title: string;
}

export const CardResources: React.FC<ICardResourcesProps> = (props) => {
  const { displayLink = true, resources, title } = props;

  if (resources == null || resources.length === 0) {
    return <CardEmptyState objectIllustration={{ object: "ARCHIVE" }} heading="No resources were added" />;
  }

  return (
    <Card className="flex flex-col gap-y-4 p-6 shadow-neutral">
      <Heading size="h3">{title}</Heading>
      <div className="flex flex-col gap-y-4">
        {resources?.map((resource) => (
          <Link
            key={resource.link}
            href={resource.link}
            variant="primary"
            iconRight={displayLink ? IconType.LINK_EXTERNAL : undefined}
            description={displayLink ? resource.link : undefined}
          >
            {resource.name}
          </Link>
        ))}
      </div>
    </Card>
  );
};
