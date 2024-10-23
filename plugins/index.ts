import { type IconType } from "@aragon/ods";

type PluginItem = {
  /** The URL fragment after /plugins */
  id: string;
  /** The name of the folder within `/plugins` */
  folderName: string;
  /** Title on menu */
  title: string;
  icon?: IconType;
  restricted?: boolean;
};

export const plugins: PluginItem[] = [
  {
    id: "stake",
    folderName: "stake",
    title: "Stake",
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
  },
  {
    id: "voting",
    folderName: "voting",
    title: "Vote",
    restricted: false,
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
  },
  {
    id: "multisig",
    folderName: "multisig",
    title: "Multisig",
    restricted: true,
    // icon: IconType.BLOCKCHAIN_BLOCKCHAIN,
  },
];
