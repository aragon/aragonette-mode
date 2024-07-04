import { Avatar, Breadcrumbs, Heading } from "@aragon/ods";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { generateBreadcrumbs } from "../../../../utils/nav";
import { postDetailQueryOptions } from "../../services/posts/query-options";

export const HeaderLearn: React.FC = () => {
  const {
    query: { slug },
    asPath,
  } = useRouter();
  const breadcrumbs = generateBreadcrumbs(asPath);

  const { data: post } = useQuery(postDetailQueryOptions({ slug: slug as string }));

  return (
    <div className="flex w-full justify-center bg-gradient-to-b from-neutral-0 to-transparent">
      <div className="flex w-full max-w-screen-lg flex-col gap-y-6 px-4 pb-6 pt-6 md:gap-y-10 md:px-16 md:pb-8 md:pt-10">
        <Breadcrumbs
          links={breadcrumbs.map((crumb, i) =>
            i === breadcrumbs.length - 1 ? { ...crumb, label: crumb.label.split("-").join(" ") } : crumb
          )}
        />
        <div className="flex flex-col gap-y-10">
          {post?.cover_img && (
            <Image
              src={post?.cover_img.img.src}
              width={post.cover_img.img.width}
              height={post.cover_img.img.height}
              alt="cover image"
              className="mx-auto max-h-[422px] w-full object-cover object-center shadow-neutral-2xl sm:rounded-2xl"
            />
          )}
          <div className="flex flex-col gap-y-3">
            <Heading size="h1">{post?.title}</Heading>
            <p className="text-lg text-neutral-500 md:text-xl">{post?.subtitle}</p>
            {/* TODO: Parse authors and connect with mainnet ens */}
            <div className="flex items-center gap-x-2">
              <Avatar src="/logo-polygon-icon.svg" size="md" />
              <div className="flex flex-col gap-y-0.25">
                <span className="font-semibold text-neutral-800">Polygon</span>
                <span className="text-neutral-400">{dayjs(post?.createdAt).format("MMMM DD, YYYY")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
