import { queryOptions } from "@tanstack/react-query";
import { membersService } from "./member-service";
import { type IFetchCouncilMembersParams } from "./params";

export const memberKeys = {
  all: ["members"] as const,
  council: (params: IFetchCouncilMembersParams) => [...memberKeys.all, "council", params] as const,
};

export function councilMemberList(params: IFetchCouncilMembersParams = {}) {
  return queryOptions({
    queryKey: memberKeys.council(params),
    queryFn: async () => membersService.fetchCouncilMembers(params),
  });
}
