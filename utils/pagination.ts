import { checkNullableParam } from "../server/utils";
import { type IPaginatedResponse } from "./types";

const DEFAULT_MAX_LIMIT = 100;

type PaginationParams = {
  page: number;
  limit: number;
};

const DefaultPaginationParams = {
  page: 1,
  limit: 10,
};

export const parsePaginationParams = (
  page: string | string[] | undefined,
  limit: string | string[] | undefined
): PaginationParams => {
  const parsedPage = checkNullableParam(page, "page");
  const parsedLimit = checkNullableParam(limit, "limit");

  if (!parsedPage && !parsedLimit) {
    return DefaultPaginationParams;
  }

  const pageInt = parsedPage ? parseInt(parsedPage) : DefaultPaginationParams.page;
  const limitInt = parsedLimit ? parseInt(parsedLimit) : DefaultPaginationParams.limit;

  return checkPaginationParams(pageInt, limitInt);
};

export const checkPaginationParams = (page: number, limit: number, total?: number) => {
  if (isNaN(limit) || limit < 1 || limit > DEFAULT_MAX_LIMIT) {
    limit = DefaultPaginationParams.limit;
  }

  if (isNaN(page) || page < 1) {
    page = DefaultPaginationParams.page;
  }

  const numPages = total ? Math.ceil(total / limit) : 0;
  if (numPages && page > numPages) {
    page = numPages;
  }

  return { page, limit, pages: numPages };
};

export const emptyPagination = {
  data: [],
  pagination: {
    total: 0,
    pages: 1,
    ...DefaultPaginationParams,
  },
};

export const paginateArray = <T>(values: T[], page: number, limit: number): IPaginatedResponse<T> => {
  const total = values.length;
  if (total === 0) {
    return emptyPagination;
  }

  const { page: newPage, limit: newLimit, pages } = checkPaginationParams(page, limit, total);

  const data = values.slice((newPage - 1) * newLimit, newPage * newLimit);

  return {
    pagination: {
      total,
      page: page,
      pages: pages,
      limit: limit,
    },
    data,
  };
};
