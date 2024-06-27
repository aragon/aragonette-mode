import { type IResource } from "@/utils/types";

export interface IDelegationWallMetadata {
  identifier: string;
  bio: string;
  message: string;
  resources?: IResource[];
}
