import { MainSection } from "@/components/layout/mainSection";
import { PostDatList } from "../components/postDataList/postDataList";
import { Heading } from "@aragon/ods";

export const LearnPage = () => {
  return (
    <MainSection className="md:px-16 md:pb-20 xl:pt-10">
      <div className="flex w-full max-w-[1280] flex-col gap-y-6">
        <header className="flex flex-col gap-y-3">
          <Heading size="h1">Learn</Heading>
          <p className="text-lg text-neutral-500">
            Find everything you need to understand Polygon’s governance. Discover the basics, dive into advanced topics,
            and stay updated with the latest developments and best practices in the blockchain world.
          </p>
        </header>
        <PostDatList />
      </div>
    </MainSection>
  );
};
