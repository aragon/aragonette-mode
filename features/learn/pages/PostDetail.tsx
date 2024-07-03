import { MainSection } from "@/components/layout/mainSection";
import { proseClasses } from "@/features/proposals";
import { formatHexString } from "@/utils/evm";
import { DocumentParser, Heading } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { postDetailQueryOptions } from "../services/posts/query-options";

export const PostDetailPage = () => {
  const {
    query: { slug },
  } = useRouter();

  const { data: post } = useQuery(postDetailQueryOptions({ slug: slug as string }));

  return (
    <MainSection className="flex justify-center !px-0 md:px-16 md:pb-20 xl:pt-10">
      <div className="flex w-full max-w-[876px] flex-col gap-y-6 sm:px-4">
        {post?.cover_img && (
          <Image
            src={post?.cover_img.img.src}
            width={post.cover_img.img.width}
            height={post.cover_img.img.height}
            alt="cover image"
            className="shadow-2xl mx-auto max-h-[422px] object-cover object-center sm:rounded-2xl"
          />
        )}
        <div className="flex flex-col gap-y-3">
          <Heading size="h1">{post?.title}</Heading>
          <p className="text-lg text-neutral-500 md:text-xl">{post?.subtitle}</p>
          <div className="flex flex-col gap-y-1">
            <span>{post?.authors.map((d) => <span key={d}>{formatHexString(d)}</span>)}</span>
            <span className="text-neutral-500">{dayjs(post?.createdAt).format("MMMM DD, YYYY")}</span>
          </div>
        </div>
        {post?.markdown && <DocumentParser document={post?.markdown} className={proseClasses} />}
      </div>
    </MainSection>
  );
};
