import { type IFetchInfinitePaginatedParams } from "@/utils/types";

export interface IFetchParagraphPostIdsQueryParams extends IFetchInfinitePaginatedParams {
  publicationSlug: string;
  categories?: string[];
}

export interface IFetchParagraphPostIdQueryParams {
  categories?: string[];
  postSlug: string;
  publicationSlug: string;
}

export type PostIds = {
  data: string[];
  hasNextPage: boolean;
};

export interface IFetchParagraphPostsParams extends IFetchInfinitePaginatedParams {
  category?: string;
}

export interface IFetchPostBySlugParams {
  slug: string;
}

export interface CoverImage {
  img: {
    src: string;
    width: number;
    height: number;
  };
  isHero: boolean;
  base64: string;
}

export interface Post {
  ugc: boolean;
  createdAt: number;
  archived: boolean;
  isUnlisted: boolean;
  id: string;
  accessRestriction: any;
  authors: string[];
  contributors: string[];
  title: string;
  subtitle: string;
  categories: string[];
  post_preview: string;
  json: string;
  staticHtml: string;
  storeOnArweave: boolean;
  sendNewsletter: boolean;
  sendXMTP: boolean;
  isScheduled: boolean;
  scheduledAt: any;
  dontPublishOnline: boolean;
  slug: string;
  publishedAt: number;
  manualPublishedAt: boolean;
  collectibleWalletAddress: string;
  collectiblesDisabled: boolean;
  cover_img: CoverImage;
  arweaveId: string;
  updatedAt: number;
  parentId: string;
  markdown: string;
  url: string;
}
