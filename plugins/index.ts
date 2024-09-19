import { PUB_TOKEN_VOTING_PLUGIN_ADDRESS, PUB_LOCK_TO_VOTE_PLUGIN_ADDRESS } from "@/constants";
import { IconType } from "@aragon/ods";

type PluginItem = {
  /** The URL fragment after /plugins */
  id: string;
  /** The name of the folder within `/plugins` */
  folderName: string;
  /** Title on menu */
  title: string;
  icon?: IconType;
  pluginAddress: string;
};

export const plugins: PluginItem[] = [
  {
    id: "token-voting",
    folderName: "__basePlugin",
    title: "(Token Voting)",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
    pluginAddress: PUB_TOKEN_VOTING_PLUGIN_ADDRESS,
  },
];
