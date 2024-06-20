import { GITHUB_API_URL } from "@/constants";
import { downloadGitHubFile } from "@/services/github";
import { type ICouncilMembersProvider } from "../../models/membership";

interface IGetGitHubCouncilDataParams {
  user: string;
  repo: string;
  council_filename: string;
}

export const getGitHubCouncilMembersData: ICouncilMembersProvider = async function (
  params: IGetGitHubCouncilDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const councilMembersUrl = `${url}/${params.council_filename}`;

  const councilMembersFile = await downloadGitHubFile(councilMembersUrl);

  const councilMembers = councilMembersFile.map((file) => {
    return JSON.parse(file.data);
  });

  return councilMembers || null;
};
