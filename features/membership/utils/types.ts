import { type IResource } from "@/utils/types";

export interface IDelegationWallMetadata {
  bio: string;
  message: string;
  resources?: IResource[];
}
