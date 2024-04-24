import { type ProposalStatus } from "@aragon/ods";
import { type ICreator, ProposalStages, ProposalTypes } from "../../services/proposal/domain";
import { type ProposalStage } from "../utils/types";
import { GITHUB_TOKEN } from "@/constants";

type GithubData = {
  link: string;
  data: string;
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

function parseProposalType(type: string): ProposalTypes {
  switch (type) {
    case "Contracts":
      return ProposalTypes.CONTRACTS;
    case "Core":
      return ProposalTypes.CORE;
    case "Informational":
      return ProposalTypes.INFORMATIONAL;
    case "Interface":
      return ProposalTypes.INTERFACE;
    default:
      return ProposalTypes.INFORMATIONAL;
  }
}

function parseStatus(status: string): ProposalStatus {
  switch (status) {
    case "Draft":
      return "draft";
    case "Last Call":
      return "draft";
    case "Continuous":
      return "accepted";
    case "Stagnant":
      return "rejected";
    case "Peer Review":
      return "draft";
    case "Final":
      return "executed";
    default:
      return "draft";
  }
}

export function parseHeader(header: string, body: string, link: string): ProposalStage {
  const parts = header.split("\n");
  const values = parts[2]
    .split("|")
    .slice(1)
    .map((v) => v.trim());

  return {
    id: ProposalStages.DRAFT,
    pip: values[0],
    title: values[1],
    description: values[2],
    body: body,
    creator: parseCreators(values[3]),
    status: parseStatus(values[5]),
    type: parseProposalType(values[6]),
    link,
  };
}

/**
 * Parse a list of creators from a comma separated string.
 * This also handles parsing markdown links for the creators.
 *
 * @param creatorList list of comma separated creators
 * @returns array of ICreator objects
 */
export function parseCreators(creatorList: string): ICreator[] {
  // matches markdown link; ex: [FirstName LastName](https://github.com/profile)
  const markdownLinkRegex = /\[([^\]]+)]\(([^)]+)\)/;

  return creatorList.split(",").map((creator) => {
    const parts = creator.match(markdownLinkRegex);

    return parts != null ? { name: parts[1], link: parts[2] } : { name: creator };
  });
}
