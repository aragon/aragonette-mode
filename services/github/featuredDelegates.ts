import { GITHUB_API_URL } from "@/constants";
import { downloadGitHubFile } from "@/services/github/fetch";
import { logger } from "@/services/logger";
import { type IFeaturedDelegateProvider } from "../../server/models/members/types";

export interface IGetGitHubFeaturedDelegatesDataParams {
  user: string;
  repo: string;
  featured_delegates_filename: string;
}

export const getGitHubFeaturedDelegatesData: IFeaturedDelegateProvider = async function (
  params: IGetGitHubFeaturedDelegatesDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const featuredDelegatesUrl = `${url}/${params.featured_delegates_filename}`;

  const featuredDelegatesFile = await downloadGitHubFile(featuredDelegatesUrl);

  const featuredDelegatesMembers = featuredDelegatesFile
    .flatMap((file) => {
      try {
        return JSON.parse(file.data);
      } catch (e) {
        logger.error("Could not parse the featured delegate data", e);
        return null;
      }
    })
    .map((member) => {
      return {
        address: member.address,
        name: member.name,
        votingPower: 0,
        delegationCount: 0,
      };
    });

  return featuredDelegatesMembers;
};
