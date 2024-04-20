import { GITHUB_TOKEN } from "@/constants";

type GithubData = {
  link: string;
  data: string;
};

export async function downloadPIPs(url: string) {
  const data = await fetch(url, {
    headers: {
      Authorization: "Bearer " + GITHUB_TOKEN,
    },
  }).then((response) => response.json());
  let result: GithubData[] = [];

  for (const item of data) {
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
