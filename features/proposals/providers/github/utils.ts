import { GITHUB_TOKEN } from "@/constants";
import {
  ProposalStages,
  type ICreator,
  type IProposalResource,
  type ProposalStatus,
} from "../../services/proposal/domain";
import { type ProposalStage } from "../../models/proposals";

type GithubData = {
  link: string;
  data: string;
};

type MarkdownLink = {
  link?: string;
  name: string;
};

export async function downloadPIPs(url: string) {
  const data = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
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

//TODO: [RD-296] Use regex to extract the header and body of the proposal
export function extractHeader(proposalBody: string) {
  const header = proposalBody
    .split("\n")
    .slice(0, 3)
    .map((line) => line.trim());
  if (!(header[0].startsWith("|") && header[1].startsWith("|") && header[2].startsWith("|"))) {
    return null;
  }
  return header.join("\n");
}

export function extractBody(proposalBody: string) {
  const bodyStart = proposalBody.indexOf("### Abstract");
  return proposalBody.slice(bodyStart);
}

function parseStatus(status: string): ProposalStatus {
  if (status === "Final") {
    return "executed";
  } else if (status === "Draft") {
    return "draft";
  } else {
    return status as ProposalStatus;
  }
}

export function parseHeader(header: string, body: string, link: string): ProposalStage {
  const parts = header.split("\n");
  const values = parts[2]
    .split("|")
    .slice(1)
    .map((v) => v.trim());

  const resources = [...(values[4].split(",").map(parseMarkdownLink) as IProposalResource[]), { name: "GitHub", link }];
  const parsedCreators: ICreator[] = values[3].split(",").map(parseMarkdownLink);

  return {
    id: ProposalStages.DRAFT,
    pip: values[0],
    title: values[1],
    description: values[2],
    body: body,
    creator: parsedCreators,
    status: parseStatus(values[5]),
    type: values[6] ?? "Informational",
    createdAt: values[7],
    resources,
  };
}

/**
 * Parse a markdown link.
 *
 * @param value markdown link
 * @returns object with name and link
 */
export function parseMarkdownLink(value: string): MarkdownLink {
  // matches markdown link; ex: [FirstName LastName](https://github.com/profile)
  const markdownLinkRegex = /\[([^\]]+)]\(([^)]+)\)/;

  const parts = value.match(markdownLinkRegex);

  return parts != null ? { name: parts[1], link: parts[2] } : { name: value };
}
