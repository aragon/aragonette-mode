import { SNAPSHOT_API_URL } from "@/constants";

export async function fetchSnapshotData<TData>(query: string) {
  const response = await fetch(SNAPSHOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const parsed: { data: TData } = await response.json();
  return parsed.data;
}
