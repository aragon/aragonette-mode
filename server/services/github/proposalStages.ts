import { GITHUB_API_URL } from "@/constants";
import { type IProposalStagesProvider, type IProposalStageProvider } from "../../models/proposals/types";
import {
  extractHeader,
  extractYamlHeader,
  extractTRBody,
  extractBody,
  parseHeader,
  parseTransparencyReport,
} from "./utils";
import { downloadGitHubFile } from "@/server/services/github/fetch";

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

  const pip_files = await downloadGitHubFile(pips_url);

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

interface IGetGitHubProposalStageDataParams {
  user: string;
  repo: string;
  pips_path: string;
  pip: string;
}

export const getGitHubProposalStageData: IProposalStageProvider = async function (
  params: IGetGitHubProposalStageDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const pip_url = `${url}/${params.pips_path}/${params.pip}.md`;

  const pip_file = await downloadGitHubFile(pip_url);

  const proposalStages = pip_file
    .flatMap((file) => {
      const header = extractHeader(file.data);
      if (!header) return [];

      const body = extractBody(file.data);
      const link = file.link;

      return { header, body, link };
    })
    .map(({ header, body, link }) => parseHeader(header, body, link));

  return proposalStages[0] || null;
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

  const transparency_report_files = await downloadGitHubFile(transparency_reports_url);

  const transparencyReports = transparency_report_files.map((file) => {
    const header = extractYamlHeader(file.data);
    if (!header) return null;
    const body = extractTRBody(file.data);
    if (!body) return null;
    return parseTransparencyReport(header, body, file.link);
  });

  return transparencyReports.filter((report) => report !== null) as any;
};

interface IGetGitHubTransparencyReportsDataParams {
  user: string;
  repo: string;
  transparency_reports_path: string;
  pip: string;
}

export const getGithubTransparencyReport: IProposalStageProvider = async function (
  params: IGetGitHubTransparencyReportsDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const transparency_report_url = `${url}/${params.transparency_reports_path}/${params.pip}.md`;

  const transparency_report_file = await downloadGitHubFile(transparency_report_url);

  const transparencyReport = transparency_report_file.map((file) => {
    const header = extractYamlHeader(file.data);
    if (!header) return null;
    const body = extractTRBody(file.data);
    if (!body) return null;
    return parseTransparencyReport(header, body, file.link);
  });

  return transparencyReport[0] || null;
};
