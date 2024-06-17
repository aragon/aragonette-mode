export function resolveQueryParam(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  else if (Array.isArray(value)) return value[0];
  return "";
}

export function encodeSearchParams(baseUrl: string, params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  // Iterate over object properties
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  // Construct the URL with encoded query parameters
  return `${baseUrl}?${searchParams.toString()}`;
}

export const generateDataListState = (
  isLoading: boolean,
  isError: boolean,
  isFetchingNextPage?: boolean,
  isFiltering?: boolean,
  isFiltered?: boolean
) => {
  if (isLoading) {
    return "initialLoading";
  } else if (isError) {
    return "error";
  } else if (isFetchingNextPage) {
    return "fetchingNextPage";
  } else if (isFiltering) {
    return "loading";
  } else {
    return isFiltered ? "filtered" : "idle";
  }
};
