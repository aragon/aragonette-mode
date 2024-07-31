import { EventDataList } from "@/features/events/components/eventDataList/eventDataList";
import { Heading } from "@aragon/ods";

export const UpcomingEvents = () => {
  return (
    <section className="flex max-w-[464px] flex-col gap-y-10 md:gap-y-14 lg:w-full">
      <div className="flex w-full flex-col gap-y-4">
        <div className="flex w-full flex-col gap-y-3">
          <Heading size="h2">Events calendar</Heading>
          <EventDataList />
        </div>
      </div>
    </section>
  );
};
