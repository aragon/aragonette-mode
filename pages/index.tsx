import { FeaturedArticles } from "@/components/featuredArticles/featuredArticles";
import { HeaderDao } from "@/components/headerDao/headerDao";
import { LatestMIPs } from "@/components/latestMIPs/latestMIPs";
import { UpcomingEvents } from "@/components/upcomingEvents/upcomingEvents";
import { type IResource } from "@/utils/types";
import { Button, Card, Heading, IconType } from "@aragon/ods";

type IDashboardResource = IResource & { cta: string };

const resources: IDashboardResource[] = [
  { name: "Governance Forum", link: "0", description: "Short description", cta: "Forum" },
  { name: "Farcaster", link: "2", description: "Short description", cta: "Farcaster" },
  { name: "Github", link: "5", description: "Short description", cta: "Github" },
];

export default function Home() {
  return (
    <>
      <HeaderDao />
      <main className="mx-auto max-w-screen-xl">
        <div className="px-4 pb-6 pt-10 md:px-6 md:pb-20">
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))] gap-4 md:gap-6">
            {resources.map((resource) => (
              <Card key={resource.link} className="flex flex-col gap-y-6 bg-neutral-0 p-6 shadow-neutral-md">
                <Heading size="h2">{resource.name}</Heading>
                <p>{resource.description}</p>
                <span className="flex">
                  <Button href={resource.link} iconRight={IconType.LINK_EXTERNAL} className="!rounded-full">
                    {resource.cta}
                  </Button>
                </span>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-10 px-4 pb-6 pt-10 md:flex-row md:gap-x-12 md:px-6 md:pb-12">
          <LatestMIPs />
          <UpcomingEvents />
        </div>
        <FeaturedArticles />
      </main>
    </>
  );
}
