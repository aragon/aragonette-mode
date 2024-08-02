import { Avatar, Heading, StateSkeletonBar, StateSkeletonCircular } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { postDetailQueryOptions } from "../../services/posts/query-options";

export const HeaderPost: React.FC = () => {
  const {
    query: { slug },
  } = useRouter();

  const { data: post, isLoading } = useQuery(postDetailQueryOptions({ slug: slug as string }));

  if (isLoading) {
    return <HeaderPostLoader />;
  }

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="flex w-full max-w-screen-lg flex-col gap-y-6 px-4 pb-6 pt-6 md:gap-y-10 md:pb-8 md:pt-10">
        <div className="flex flex-col gap-y-10">
          {post?.cover_img && (
            <Image
              src={post.cover_img.img.src}
              width={post.cover_img.img.width}
              height={post.cover_img.img.height}
              alt="cover image"
              className="shadow-neutral-lg mx-auto max-h-[422px] w-full object-cover object-center sm:rounded-2xl"
            />
          )}
          <div className="flex flex-col gap-y-3">
            <Heading size="h1">{post?.title}</Heading>
            <p className="text-lg text-neutral-500 md:text-xl">{post?.subtitle}</p>
            <div className="flex items-center gap-x-2">
              <Avatar src="/mode-logo.png" size="md" />
              <div className="flex flex-col gap-y-0.25">
                <span className="font-semibold text-neutral-800">Mode</span>
                <span className="text-neutral-400">{dayjs(post?.createdAt).format("MMMM DD, YYYY")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderPostLoader = () => {
  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="flex w-full max-w-screen-lg flex-col gap-y-6 px-4 pb-6 pt-6 md:gap-y-10 md:pb-8 md:pt-10">
        <div className="flex flex-col gap-y-10">
          <StateSkeletonBar
            className="shadow-neutral-lg mx-auto h-[200px] max-h-[422px] w-full !rounded-none !bg-neutral-100 object-cover object-center sm:!rounded-2xl md:h-[362px] lg:h-[422px]"
            width={"100%"}
          />

          <div className="flex flex-col gap-y-3">
            <StateSkeletonBar width="35%" className="h-[40px] !bg-neutral-100" />
            <StateSkeletonBar width="50%" className="h-[30px] !bg-neutral-100" />

            <div className="flex items-center gap-x-2">
              <StateSkeletonCircular className="size-[32px] !bg-neutral-100" />
              <div className="flex flex-col gap-y-1">
                <StateSkeletonBar width="100px" className="h-6 !bg-neutral-100" />
                <StateSkeletonBar width="130px" className="h-6 !bg-neutral-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
