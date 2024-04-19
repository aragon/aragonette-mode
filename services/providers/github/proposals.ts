import { ProposalTypes, ProposalStages } from "@/features/proposals/services/proposal/domain";
import { type ProposalStatus } from "@aragon/ods";
import { IProposalStageProvider, ProposalStage } from "../utils/types";
import { downloadPIPs } from "./queries";
import { GITHUB_API_URL } from "@/constants";

//TODO: Use regex to extract the header and body of the proposal
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
    case "Critical":
      return ProposalTypes.CRITICAL;
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
    case "closed":
      return "rejected";
    case "Accepted":
      return "accepted";
    case "Rejected":
      return "rejected";
    case "Implemented":
      return "executed";
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
    creator: values[3],
    status: parseStatus(values[5]),
    type: parseProposalType(values[6]),
    link,
  };
}

const requestGithubData = async function (url: string) {
  const files = await downloadPIPs(url);

  const proposalPhases = files
    .flatMap((file) => {
      const header = extractHeader(file.data);
      if (!header) return [];

      const body = extractBody(file.data);
      const link = file.link;

      return { header, body, link };
    })
    .map(({ header, body, link }) => parseHeader(header, body, link));

  return proposalPhases;
};

export const getGithubProposalData: IProposalStageProvider = async function (params: {
  user: string;
  repo: string;
  path: string;
}) {
  return requestGithubData(GITHUB_API_URL + "/repos/" + params.user + "/" + params.repo + "/contents/" + params.path);
};
