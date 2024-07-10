import { GITHUB_API_URL } from "@/constants";
import { downloadGitHubFile } from "@/services/github/fetch";
import { type ICouncilMembersProvider } from "../../server/models/members/types";

export interface IGetGitHubCouncilDataParams {
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

  const councilMembers = councilMembersFile.flatMap((file) => {
    return JSON.parse(file.data);
  });

  return councilMembers || null;
};
