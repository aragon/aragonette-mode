import { GITHUB_API_URL } from "@/constants";
import { type IProposalStageProvider } from "../utils/types";
import { extractHeader, extractBody, parseHeader, downloadPIPs } from "./utils";

interface IGetGitHubProposalStagesDataParams {
  user: string;
  repo: string;
  pips_path: string;
  transparency_reports_path: string;
}

export const getGitHubProposalStagesData: IProposalStageProvider = async function (
  params: IGetGitHubProposalStagesDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const pips_url = `${url}/${params.pips_path}`;
  const transparency_reports_url = `${url}/${params.transparency_reports_path}`;

  const pip_files = await downloadPIPs(pips_url);
  const transparency_report_files = await downloadPIPs(transparency_reports_url);

  const proposalStages = pip_files
    .flatMap((file) => {
      const header = extractHeader(file.data);
      if (!header) return [];

      const body = extractBody(file.data);
      const link = file.link;

      return { header, body, link };
    })
    .map(({ header, body, link }) => parseHeader(header, body, link))
    .map((proposal) => {
      const transparency_report = transparency_report_files.find((file) => {
        const file_link = file.link.split("/").pop();
        return proposal.pip && file_link ? extractProposalNumber(file_link) === proposal.pip : false;
      });

      if (transparency_report) {
        proposal.transparency_report = transparency_report.data;
        proposal.resources.push({
          name: "Transparency Report",
          link: transparency_report.link,
        });
      }

      return proposal;
    });

  return proposalStages;
};

function extractProposalNumber(link: string) {
  const match = link.match(/-(\d+)/);
  return match ? match[1] : null;
}
