import { DocumentParser, StateSkeletonBar, Tag } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { HeaderPost } from "../components/headerPost/headerPost";
import { postDetailQueryOptions } from "../services/posts/query-options";
import { proseClasses } from "@/components/documentParser/utils";

export const PostDetailPage = () => {
  const {
    query: { slug },
  } = useRouter();

  const { data: post, isLoading } = useQuery(postDetailQueryOptions({ slug: slug as string }));

  return (
    <div className="flex flex-col items-center">
      <HeaderPost />
      {isLoading && <PostDetailLoader />}
      {post && (
        <div className="flex w-full max-w-screen-lg flex-col gap-x-16 gap-y-12 px-4 pb-6 md:pb-20">
          {post.markdown && <DocumentParser document={post.markdown} className={proseClasses} />}
          <div className="flex gap-x-2">
            {post.categories.map((c) => (
              <Tag key={c} variant="primary" label={`#${c}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PostDetailLoader = () => {
  return (
    <div className="flex w-full max-w-screen-lg flex-col gap-x-16 gap-y-12 px-4 pb-6 md:pb-20">
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-2">
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"80%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
        </div>
        <div className="flex flex-col gap-y-2">
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"83%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"90%"} />
        </div>
        <div className="flex flex-col gap-y-2">
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"85%"} />
          <StateSkeletonBar className="h-6 !bg-neutral-100" width={"86%"} />
        </div>
      </div>
      <div className="flex gap-x-2">
        <StateSkeletonBar className="h-6 !bg-neutral-100" width={"5%"} />
        <StateSkeletonBar className="h-6 !bg-neutral-100" width={"5%"} />
      </div>
    </div>
  );
};
