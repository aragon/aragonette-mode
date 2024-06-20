import { GITHUB_API_URL } from "@/constants";
import { downloadGitHubFile } from "@/services/github";
import { IFeatureDelegateProvider } from "../../models/membership";
import { logger } from "@/services/logger";
import { IMemberDataListItem } from "../../services/members/domain";

interface IGetGitHubFeatureDataParams {
  user: string;
  repo: string;
  featured_delegates_filename: string;
}

export const getGitHubFeaturedDelegatesData: IFeatureDelegateProvider = async function (
  params: IGetGitHubFeatureDataParams
) {
  const url = `${GITHUB_API_URL}/repos/${params.user}/${params.repo}/contents`;
  const featuredDelegatesUrl = `${url}/${params.featured_delegates_filename}`;

  const featuredDelegatesFile = await downloadGitHubFile(featuredDelegatesUrl);

  const featuredDelegatesMembers = featuredDelegatesFile.flatMap((file) => {
    try {
      const member = JSON.parse(file.data);

      if (!member?.address) return null;

      return {
        address: member.address,
        name: member.name,
        votingPower: 0,
        delegationCount: 0,
      } as IMemberDataListItem;
    } catch (e) {
      logger.error("Could not parse the featured delegate data", e);
      return null;
    }
  }) as IMemberDataListItem[];

  return featuredDelegatesMembers;
};
