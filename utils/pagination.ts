import { IPaginatedResponse } from "./types";

export const checkPaginationParams = (page: number, limit: number, total: number, maxLimit: number = 100) => {
  if (isNaN(limit) || limit < 1 || limit > maxLimit) {
    limit = 10;
  }

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (page > Math.ceil(total / limit)) {
    page = Math.ceil(total / limit);
  }

  return { page, limit, pages: Math.ceil(total / limit) };
};

export const emptyPagination = {
  data: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
};

export const paginateArray = <T>(delegates: T[], page: number, limit: number): IPaginatedResponse<T> => {
  const total = delegates.length;
  if (total === 0) {
    return emptyPagination;
  }

  if (total / limit < page) {
    page = Math.ceil(total / limit);
  }
  const data = delegates.slice((page - 1) * limit, page * limit);

  return {
    pagination: {
      total,
      page: page,
      pages: Math.ceil(total / limit),
      limit: limit,
    },
    data,
  };
};
