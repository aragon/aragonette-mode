export type Action = {
  to: string;
  value: bigint;
  data: string;
};

export interface IAlert {
  id: number;
  type: "success" | "info" | "error";
  message: string;
  description?: string;
  explorerLink?: string;
  dismissTimeout?: ReturnType<typeof setTimeout>;
}

// General types

type JsonLiteral = string | number | boolean;
export type JsonValue = JsonLiteral | Record<string, JsonLiteral> | Array<JsonLiteral>;

// Response type
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pages: number;
    limit: number;
    total: number;
  };
}

// type for links
export interface IResource {
  name: string;
  link: string;
  description?: string;
}

export interface IFetchPaginatedParams {
  page?: number;
  limit?: number;
}

export interface IInfiniteDataResponse<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    total?: number;
    cursor?: string;
  };
}

export interface IFetchInfinitePaginatedParams {
  limit?: number;
  cursor?: string;
}

export interface IError {
  error: {
    message: string;
  };
}
