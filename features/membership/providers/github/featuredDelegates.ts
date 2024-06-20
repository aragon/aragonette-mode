import { GITHUB_API_URL } from "@/constants";
import { downloadPIPs } from "@/services/github";
import { IFeatureDelegateProvider } from "../../models/membership";

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

  const featuredDelegatesFile = await downloadPIPs(featuredDelegatesUrl);

  const featuredDelegatesMembers = featuredDelegatesFile
    .flatMap((file) => {
      return JSON.parse(file.data);
    })
    .map((member) => {
      return {
        address: member.address,
        name: member.name,
        votingPower: 0,
        delegationCount: 0,
      };
    });

  return featuredDelegatesMembers || null;
};
