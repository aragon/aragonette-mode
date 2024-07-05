import { logger } from "@/services/logger";
import { type IInfiniteDataResponse } from "@/utils/types";
import arweave from "./arweave";
import {
  type ParagraphPostIdBySlugQueryResponse,
  getParagraphPostIdBySlugQuery,
  getParagraphPostIdsQuery,
  type ParagraphPostIdsQueryResponse,
} from "./gql";
import {
  type IFetchPostBySlugParams,
  type IFetchParagraphPostIdsQueryParams,
  type IFetchParagraphPostsParams,
  type Post,
  type IFetchParagraphPostIdQueryParams,
} from "./types";
import { PUB_ARWEAVE_API_URL, PUB_PARAGRAPH_PUBLICATION_SLUG } from "@/constants";

/**
 * Service for managing paragraph posts.
 */
class ParagraphPostService {
  private endPoint: string;
  private publicationSlug: string;

  constructor(endPoint: string, publicationSlug: string) {
    this.endPoint = endPoint;
    this.publicationSlug = publicationSlug;
  }
  /**
   * Retrieves the IDs of paragraph posts based on the specified parameters.
   * @param params - The parameters for the query.
   * @returns A promise that resolves to an array of post IDs.
   * @throws If there was an error retrieving the post IDs.
   */
  private getPostIds = async (params: IFetchParagraphPostIdsQueryParams): Promise<IInfiniteDataResponse<string>> => {
    try {
      const response = await fetch(this.endPoint, {
        method: "POST",
        headers: {
          "Accept-Encoding": "gzip, deflate, br",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: getParagraphPostIdsQuery(params),
        }),
      });

      const {
        data: {
          transactions: { pageInfo, edges },
        },
      }: ParagraphPostIdsQueryResponse = await response.json();

      return {
        data: edges.map((edge) => edge.node.id),
        pagination: {
          hasNextPage: pageInfo.hasNextPage,
          cursor: pageInfo.hasNextPage ? edges[edges.length - 1].cursor : undefined,
        },
      };
    } catch (error) {
      logger.error("Failed to get post IDs", error);
      throw error;
    }
  };

  /**
   * Retrieves a transaction id using the publication and post slug
   * @returns transaction id
   */
  private getTransactionIdBySlug = async (params: IFetchParagraphPostIdQueryParams): Promise<string> => {
    try {
      const response = await fetch(this.endPoint, {
        method: "POST",
        headers: {
          "Accept-Encoding": "gzip, deflate, br",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: getParagraphPostIdBySlugQuery(params),
        }),
      });

      const {
        data: {
          transactions: { edges },
        },
      }: ParagraphPostIdBySlugQueryResponse = await response.json();

      return edges[0].node.id;
    } catch (error) {
      logger.error(`Failed to get post ID for slug ${params.postSlug}`, error);
      throw error;
    }
  };

  /**
   * Get the unique posts from a list of post
   * @param posts list of posts to filter
   * @returns the unique posts from a using the most recent version of a post as the filter
   */
  private getUniquePosts = (posts: Post[]): Post[] => {
    // Create a map to track the latest post for each id
    const latestPostsMap = new Map<string, Post>();

    posts.forEach((post) => {
      const existingPost = latestPostsMap.get(post.id);

      // If there's no post with the same id, or if the current post is more recent, update the map
      if (!existingPost || (post.updatedAt > existingPost.updatedAt && !post.isUnlisted)) {
        latestPostsMap.set(post.id, post);
      }
    });

    // Convert the map values to an array
    return Array.from(latestPostsMap.values());
  };

  /**
   * Retrieves the paragraph posts.
   * @returns A promise that resolves to an array of paragraph posts.
   * @throws If there was an error retrieving the posts.
   */
  getPosts = async (params?: IFetchParagraphPostsParams): Promise<IInfiniteDataResponse<Post>> => {
    const { data: postIds, pagination } = await this.getPostIds({
      ...params,
      categories: params?.category ? [params.category] : [],
      publicationSlug: this.publicationSlug,
    });

    try {
      const posts: Post[] = await Promise.all(
        postIds.map(async (id) => {
          const data = await arweave.transactions.getData(id, { decode: true, string: true });
          return JSON.parse(data as string);
        })
      );

      const uniquePosts = this.getUniquePosts(posts);

      return { data: uniquePosts, pagination: { ...pagination, total: uniquePosts.length } };
    } catch (error) {
      logger.error("Failed to get posts", error);
      throw error;
    }
  };

  /**
   * Retrieves a paragraph post by its ID.
   * @param id - The ID of the post.
   * @returns A promise that resolves to the paragraph post.
   * @throws If there was an error retrieving the post.
   */
  getPostById = async (id: string): Promise<Post> => {
    try {
      const data = await arweave.transactions.getData(id, { decode: true, string: true });
      const parsed: Post = JSON.parse(data as string);
      return parsed;
    } catch (error) {
      logger.error(`Failed to get post with id ${id}`, error);
      throw error;
    }
  };

  /**
   * Retrieves a paragraph post by its slug.
   * @param slug - The slug of the post.
   * @returns A promise that resolves to the paragraph post.
   * @throws If there was an error retrieving the post or if no post with the slug is found.
   */
  getPostBySlug = async (params: IFetchPostBySlugParams): Promise<Post> => {
    try {
      const postId = await this.getTransactionIdBySlug({
        postSlug: params.slug,
        publicationSlug: this.publicationSlug,
      });
      const data = await arweave.transactions.getData(postId, { decode: true, string: true });
      return JSON.parse(data as string);
    } catch (error) {
      logger.error(`Failed to get post with slug ${params.slug}`, error);
      throw error;
    }
  };
}

export const postService = new ParagraphPostService(PUB_ARWEAVE_API_URL, PUB_PARAGRAPH_PUBLICATION_SLUG);
