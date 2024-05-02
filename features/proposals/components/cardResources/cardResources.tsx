import { Card, CardEmptyState, Heading, IconType, Link } from "@aragon/ods";
import React from "react";

export type ProposalResource = {
  name: string;
  url: string;
};

interface ICardResourcesProps {
  resources?: ProposalResource[];
}

export const CardResources: React.FC<ICardResourcesProps> = (props) => {
  const { resources } = props;

  if (resources == null || resources.length === 0) {
    return <CardEmptyState objectIllustration={{ object: "ARCHIVE" }} heading="No resources were added" />;
  }

  return (
    <Card className="flex flex-col gap-y-4 p-6">
      <Heading size="h3">Resources</Heading>
      <div className="flex flex-col gap-y-3">
        {resources?.map((resource) => (
          <Link
            key={resource.url}
            href={resource.url}
            variant="primary"
            iconRight={IconType.LINK_EXTERNAL}
            description={resource.url}
          >
            {resource.name}
          </Link>
        ))}
      </div>
    </Card>
  );
};
