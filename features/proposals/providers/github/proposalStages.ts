import { GITHUB_API_URL } from "@/constants";
import { type IProposalStageProvider } from "../utils/types";
import { extractHeader, extractBody, parseHeader, downloadPIPs } from "./utils";

interface IGetGitHubProposalStagesDataParams {
  user: string;
  repo: string;
  path: string;
}

export const getGitHubProposalStagesData: IProposalStageProvider = async function (
  params: IGetGitHubProposalStagesDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents/${params.path}`;

  const files = await downloadPIPs(url);

  const proposalStages = files
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
