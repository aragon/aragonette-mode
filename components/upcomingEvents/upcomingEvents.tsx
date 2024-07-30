import { eventList } from "@/features/events/services/query-options";
import { type IResource } from "@/utils/types";
import { Heading, Card, IconType, Link } from "@aragon/ods";
import { useInfiniteQuery } from "@tanstack/react-query";

const resources: IResource[] = [
  { name: "Governance Forum", link: "", description: "Short description" },
  { name: "Twitter", link: "", description: "Short description" },
  { name: "Farcaster", link: "", description: "Short description" },
  { name: "PPGC Repo", link: "", description: "Short description" },
  { name: "Layer 3", link: "", description: "Short description" },
  { name: "Github", link: "", description: "Short description" },
];

export const UpcomingEvents = () => {
  const { data } = useInfiniteQuery(eventList());

  return (
    <section className="flex max-w-[464px] flex-col gap-y-10 md:gap-y-16">
      <div className="flex w-full flex-col gap-y-4">
        <div className="flex flex-col gap-y-3">
          <Heading size="h2">Upcoming events</Heading>
          <p className="text-base text-neutral-500">
            In the Polygon governance community, events happen regularly, so you can stay up to date. See the latest
            ones and start participating.
          </p>
          {data?.events?.map((e) => <div key={e.id}>{`${e.summary}`}</div>)}
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
