import { GITHUB_TOKEN } from "@/constants";
import Cache from "@/services/cache/VercelCache";

type GithubData = {
  link: string;
  data: string;
};

const cachedFetch = async (url: string, headers?: any, ttl: number = 600): Promise<string> => {
  const cache = new Cache();

  const cachedData = await cache.get(url);

  if (cachedData) {
    if (typeof cachedData == "string") return cachedData;
    if (typeof cachedData == "object") return JSON.stringify(cachedData);

    throw new Error("Unknown type: ", cachedData);
  }

  const response = await fetch(url, headers);
  const data = await response.text();
  await cache.set(url, data, ttl);
  return data;
};

export async function downloadPIPs(url: string) {
  const data: string = await cachedFetch(
    url,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    },
    60 * 15
  );

  let githubData = JSON.parse(data);

  if (!Array.isArray(githubData)) githubData = [githubData];

  let result: GithubData[] = [];

  for (const item of githubData) {
    if (item.type === "file") {
      const fileUrl = item.download_url;
      const fileResponse = await fetch(fileUrl);
      const fileData = await fileResponse.text();

      result.push({
        link: item.html_url,
        data: fileData,
      });
    } else if (item.type === "dir") {
      const res = await downloadPIPs(item.url);
      result = result.concat(res);
    }
  }

  return result;
}
