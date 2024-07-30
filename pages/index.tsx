import { FeaturedArticles } from "@/components/featuredArticles/featuredArticles";
import { LatestPIPs } from "@/components/latestPIPs/latestPIPs";
import { UpcomingEvents } from "@/components/upcomingEvents/upcomingEvents";

export default function Home() {
  return (
    <>
      {/* <header className="w-full border">Header</header> */}
      <main className="mx-auto max-w-screen-xl">
        <div className="flex flex-col gap-y-10 px-4 pb-6 pt-10 md:flex-row md:gap-x-12 md:px-6 md:pb-20">
          <LatestPIPs />
          <UpcomingEvents />
        </div>
        <FeaturedArticles />
      </main>
    </>
  );
}
