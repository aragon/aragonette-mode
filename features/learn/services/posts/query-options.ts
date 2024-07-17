import { postService } from "@/services/paragraph/paragraphPostService";
import { type IFetchPostBySlugParams, type IFetchParagraphPostsParams } from "@/services/paragraph/types";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

export const postKeys = {
  all: ["posts"] as const,
  list: (params: IFetchParagraphPostsParams) => [...postKeys.all, "list", params] as const,
  postDetail: (params: IFetchPostBySlugParams) => [...postKeys.all, "detail", params] as const,
};

export function postListQueryOptions(params: IFetchParagraphPostsParams = {}) {
  return infiniteQueryOptions({
    queryKey: postKeys.list(params),
    queryFn: async (ctx) => postService.getPosts({ ...params, cursor: ctx.pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage?.pagination?.cursor,
    select: (data) => ({ posts: data.pages.flatMap((p) => p.data), pagination: data.pages[0].pagination }),
  });
}

export function postDetailQueryOptions(params: IFetchPostBySlugParams) {
  return queryOptions({
    queryKey: postKeys.postDetail(params),
    queryFn: async () => postService.getPostBySlug(params),
  });
}
