import { ProposalDetails } from "@/components/nav/routes";
import { GITHUB_TOKEN, PUB_BASE_URL } from "@/constants";
import Cache from "@/services/cache/VercelCache";
import { type ProposalStage } from "../../models/proposals";
import {
  ProposalStages,
  type ICreator,
  type IProposalResource,
  ProposalStatus,
  StageStatus,
} from "../../services/proposal/domain";
import yaml from "js-yaml";

type GithubData = {
  link: string;
  data: string;
};

type MarkdownLink = {
  link?: string;
  name: string;
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

  const githubData = JSON.parse(data);

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

export function extractYamlHeader(proposalBody: string) {
  /* Matches the YAML header of the proposal
    ---  <--- Start of the YAML header
    EMP: 1
    title: Polygon Ecosystem Token (POL)
    description: Deploy the Polygon Ecosystem Token (POL)
    author: Mudit Gupta
    discussion: https://www.youtube.com/watch?v=MwlxxnVh4no&t=185s
    status: Executed
    type: Contracts
    date: 2023-02-22 <--- End of the YAML header
    ---
    ..
  */
  const yamlHeader = proposalBody.match(/((?:^---$)\n(?:.*\n)+)(^---$)/m);
  return yamlHeader?.[1];
}

export function extractBody(proposalBody: string) {
  const bodyStart = proposalBody.indexOf("### Abstract");
  return proposalBody.slice(bodyStart);
}

function parseDraftStatus(status: string): [StageStatus, ProposalStatus] {
  switch (status) {
    case "Continuous":
    case "Final":
      return [StageStatus.APPROVED, ProposalStatus.EXECUTED];
    case "Draft":
    case "Stagnant":
    case "Last Call":
    case "Peer Review":
      return [StageStatus.PENDING, ProposalStatus.PENDING];
    default:
      return [StageStatus.PENDING, ProposalStatus.PENDING];
  }
}

function parseTransparencyReportStatus(status: string): [StageStatus, ProposalStatus] {
  switch (status) {
    case "Executed":
      return [StageStatus.APPROVED, ProposalStatus.EXECUTED];
    case "Draft":
      return [StageStatus.PENDING, ProposalStatus.PENDING];
    default:
      return [StageStatus.PENDING, ProposalStatus.PENDING];
  }
}

function extractIncludedPIPS(body: string): string[] {
  // Regex to isolate the "Included PIPs" section.
  const sectionRegex = /### Included [AP]IPs\s+([^#]+)/;
  const sectionMatch = body.match(sectionRegex);

  if (sectionMatch) {
    const includedSection = sectionMatch[1];
    // regex to capture only the markdown links.
    const pattern = /\[(.*?)\]\((.*?)\)/g;
    return includedSection.match(pattern) ?? [];
  }

  return [];
}

function parseIncludedPIPs(includedPips: string[]): IProposalResource[] {
  const pipPattern = /AIP|PIP-(\d+)/;

  return includedPips.map((pip) => {
    const resource = parseMarkdownLink(pip);
    const pipId = `PIP-${resource.name.match(pipPattern)?.[1]}`;

    return (
      pipId ? { ...resource, link: `${PUB_BASE_URL}${ProposalDetails.getPath(pipId)}` } : resource
    ) as IProposalResource;
  });
}

export function parseHeader(header: string, body: string, link: string): ProposalStage {
  const parts = header.split("\n");
  const values = parts[2]
    .split("|")
    .slice(1)
    .map((v) => v.trim());

  const resources = [...(values[4].split(",").map(parseMarkdownLink) as IProposalResource[]), { name: "Github", link }];
  const parsedCreators: ICreator[] = values[3].split(",").map(parseMarkdownLink);
  const includedPIPs = parseIncludedPIPs(extractIncludedPIPS(body));
  const isMainProposal = includedPIPs.length > 0;
  const pip = link.split("/").pop()?.split(".").shift() ?? "undefined";

  const isDate = !isNaN(Date.parse(values[7]));
  const createdAt = isDate ? new Date(values[7]) : undefined;

  const [status, overallStatus] = parseDraftStatus(values[5]);

  return {
    stageType: ProposalStages.DRAFT,
    pip,
    title: values[1],
    description: values[2],
    body: body,
    creator: parsedCreators,
    status,
    overallStatus,
    statusMessage: values[5],
    type: values[6] ?? "Informational",
    createdAt,
    resources,
    bindings: [],
    actions: [],
    includedPips: isMainProposal ? includedPIPs : undefined,
    parentPip: isMainProposal ? undefined : { name: "tbd", link: "tbd" },
  };
}

type TransparencyReportHeader = {
  SOS: number;
  title: string;
  description: string;
  author: string;
  discussion: string;
  status: string;
  type: string;
  date: Date;
};

export function parseYamlHeader(header: string) {
  return yaml.load(header) as TransparencyReportHeader;
}

export function parseCreators(value: string): ICreator[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .map((c) => {
      return {
        name: c,
      };
    });
}

export function parseTransparencyReport(header: string, body: string, link: string): ProposalStage {
  const parts = parseYamlHeader(header);

  const parsedCreators = parseCreators(parts.author);
  const [status, overallStatus] = parseTransparencyReportStatus(parts.status);

  return {
    stageType: ProposalStages.TRANSPARENCY_REPORT,
    pip: "SOS-" + parts.SOS,
    title: parts.title,
    description: parts.description,
    body,
    creator: parsedCreators,
    status,
    overallStatus,
    statusMessage: undefined,
    type: parts.type,
    createdAt: parts.date,
    resources: [{ name: "Github", link }],
    bindings: [],
    actions: [],
    includedPips: undefined,
    parentPip: undefined,
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
