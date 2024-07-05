import { proseClasses } from "@/features/proposals";
import { DocumentParser, Tag } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { HeaderPost } from "../components/headerPost/headerPost";
import { postDetailQueryOptions } from "../services/posts/query-options";

export const PostDetailPage = () => {
  const {
    query: { slug },
  } = useRouter();

  const { data: post } = useQuery(postDetailQueryOptions({ slug: slug as string }));

  return (
    <div className="flex flex-col items-center">
      <HeaderPost />
      <div className="flex w-full max-w-screen-lg flex-col gap-x-16 gap-y-12 px-4 pb-6 md:px-16 md:pb-20">
        {post?.markdown && <DocumentParser document={post?.markdown} className={proseClasses} />}
        <div className="flex gap-x-2">
          {post?.categories.map((c) => <Tag key={c} variant="primary" label={`#${c}`} />)}
        </div>
      </div>
    </div>
  );
};
