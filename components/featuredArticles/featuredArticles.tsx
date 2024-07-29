import { PostDatList } from "@/features/learn/components/postDataList/postDataList";
import { Heading } from "@aragon/ods";

export const FeaturedArticles = () => {
  return (
    <section className="flex flex-col gap-y-6 px-4 pb-6 pt-10 md:px-6 md:pb-20">
      <Heading size="h1">Featured articles</Heading>
      <PostDatList category="featured" pageSize={3} />
    </section>
  );
};
