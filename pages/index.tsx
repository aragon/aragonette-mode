import { FeaturedArticles } from "@/components/featuredArticles/featuredArticles";
import { HeaderDao } from "@/components/headerDao/headerDao";
import { LatestProposals } from "@/components/latestProposals/latestProposals";
import { UpcomingEvents } from "@/components/upcomingEvents/upcomingEvents";
import { type IResource } from "@/utils/types";
import { Button, Card, Heading } from "@aragon/ods";

type IDashboardResource = IResource & { cta: string; primary?: boolean };

const resources: IDashboardResource[] = [
  {
    name: "Governance Forum",
    link: "0",
    description: "View and formally comment on proposals.",
    cta: "Visit",
    primary: true,
  },
  {
    name: "Discussion",
    link: "https://discord.com/invite/modenetworkofficial",
    description:
      "For general inquiries, active debate and discussion for all things Mode. Chat about from Governance, Building or Discovering the latest opportunities on Mode.",
    cta: "Join Discord",
  },
  {
    name: "Bridge",
    link: "https://www.mode.network/developers",
    description:
      "Build on Mode: Push the limits with our community of hungry and talented builders. What innovations are you working on?",
    cta: "Start building",
  },
];

export default function Home() {
  return (
    <>
      <HeaderDao />
      <main className="mx-auto max-w-screen-xl">
        <div className="px-4 pb-6 pt-10 md:px-6 md:pb-20">
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] gap-6 md:gap-6">
            {resources.map((resource) => (
              <Card key={resource.link} className="flex flex-col gap-y-6 bg-neutral-0 p-6 shadow-neutral-md">
                <Heading size="h2">{resource.name}</Heading>
                <p className="text-neutral-500">{resource.description}</p>
                <span className="flex">
                  <Button
                    href={resource.link}
                    variant={resource.primary ? "primary" : "secondary"}
                    className="!rounded-full"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {resource.cta}
                  </Button>
                </span>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-10 px-4 pb-6 pt-10 md:flex-row md:gap-x-12 md:px-6 md:pb-12">
          <LatestProposals />
          <UpcomingEvents />
        </div>
        <FeaturedArticles />
      </main>
    </>
  );
}
