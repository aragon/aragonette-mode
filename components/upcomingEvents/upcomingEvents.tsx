import { EventDataList } from "@/features/events/components/eventDataList/eventDataList";
import { type IResource } from "@/utils/types";
import { Card, Heading, IconType, Link } from "@aragon/ods";

const resources: IResource[] = [
  { name: "Governance Forum", link: "0", description: "Short description" },
  { name: "Twitter", link: "1", description: "Short description" },
  { name: "Farcaster", link: "2", description: "Short description" },
  { name: "Github", link: "5", description: "Short description" },
];

export const UpcomingEvents = () => {
  return (
    <section className="flex max-w-[464px] flex-col gap-y-10 md:gap-y-14 lg:w-full">
      <div className="flex w-full flex-col gap-y-4">
        <div className="flex w-full flex-col gap-y-3">
          <Heading size="h2">Upcoming events</Heading>
          <EventDataList />
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        <Heading size="h2">Links</Heading>
        <Card className="flex flex-col gap-y-4 bg-neutral-0 p-6 shadow-neutral">
          {resources.map((r) => (
            <Link
              key={r.link}
              href={r.link}
              iconRight={IconType.LINK_EXTERNAL}
              description={r.description}
              rel="noopener noreferrer"
              target="_blank"
            >
              {r.name}
            </Link>
          ))}
        </Card>
      </div>
    </section>
  );
};
