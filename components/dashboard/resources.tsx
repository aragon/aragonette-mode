import React from "react";
import { PUB_DISCORD_URL } from "@/constants";
import { Button, Card, Heading } from "@aragon/ods";

const resources = [
  {
    name: "Governance Forum",
    link: "https://modenetwork.notion.site",
    description:
      "Visit the Mode governance forum to see the latest developments in the community. Comment on or submit proposals for partnerships, services, or general protocol improvements.",
    cta: "Visit",
  },
  {
    name: "Discussion",
    link: PUB_DISCORD_URL,
    description:
      "For general inquiries, active debate and discussion for all things Mode. Chat about Governance, Building or Discovering the latest opportunities on Mode.",
    cta: "Join Discord",
  },
  {
    name: "Developers",
    link: "https://www.mode.network/developers",
    description:
      "Build on Mode: Push the limits with our community of hungry and talented builders. What innovations are you working on?",
    cta: "Start building",
  },
];

export const DashboardResources = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-6 pt-12 sm:grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] md:gap-6">
      {resources.map((resource) => (
        <Card key={resource.link} className="flex flex-col justify-between gap-y-6 bg-neutral-0 p-6 shadow-neutral-md">
          <Heading size="h2">{resource.name}</Heading>
          <div className="flex grow flex-col justify-start">
            <p className="text-neutral-500">{resource.description}</p>
          </div>
          <span className="flex">
            <Button href={resource.link} className="!rounded-full" rel="noopener noreferrer" target="_blank">
              {resource.cta}
            </Button>
          </span>
        </Card>
      ))}
    </div>
  );
};
