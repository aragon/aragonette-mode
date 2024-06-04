import { GITHUB_API_URL } from "@/constants";
import { type IProposalStagesProvider } from "../../models/proposals";
import {
  extractHeader,
  extractYamlHeader,
  extractBody,
  parseHeader,
  downloadPIPs,
  parseTransparencyReport,
} from "./utils";

interface IGetGitHubProposalStagesDataParams {
  user: string;
  repo: string;
  pips_path: string;
}

export const getGitHubProposalStagesData: IProposalStagesProvider = async function (
  params: IGetGitHubProposalStagesDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const pips_url = `${url}/${params.pips_path}`;

  const pip_files = await downloadPIPs(pips_url);

  const proposalStages = pip_files
    .flatMap((file) => {
      const header = extractHeader(file.data);
      if (!header) return [];

      const body = extractBody(file.data);
      const link = file.link;

      return { header, body, link };
    })
    .map(({ header, body, link }) => parseHeader(header, body, link));

  return proposalStages;
};

interface IGetGitHubTransparencyReportsDataParams {
  user: string;
  repo: string;
  transparency_reports_path: string;
}

export const getGithubTransparencyReports: IProposalStagesProvider = async function (
  params: IGetGitHubTransparencyReportsDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const transparency_reports_url = `${url}/${params.transparency_reports_path}`;

  const transparency_report_files = await downloadPIPs(transparency_reports_url);

  const transparencyReports = transparency_report_files
    .map((file) => {
      const file_link = file.link.split("/").pop();
      const proposalNumber = file_link ? extractProposalNumber(file_link) : null;
      return { proposalNumber, data: file.data, link: file.link };
    })
    .map(({ proposalNumber, data, link }) => {
      const header = extractYamlHeader(data);
      if (!header) return null;
      return parseTransparencyReport(header, data, link);
    });

  return transparencyReports.filter((report) => report !== null) as any;
};

function extractProposalNumber(link: string) {
  const match = link.match(/-(\d+)/);
  return match ? match[1] : null;
}
