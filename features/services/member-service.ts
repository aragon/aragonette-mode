import { PUB_API_BASE_URL } from "@/constants";
import { type ICouncilMemberDataListItem } from "@/server/client/types/domain";
import { encodeSearchParams } from "@/utils/query";
import type { IFetchCouncilMembersParams } from "./params";

class MemberService {
  async fetchCouncilMembers(params: IFetchCouncilMembersParams): Promise<ICouncilMemberDataListItem[]> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/councilMembers`, params);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch");
    }

    const parsed: ICouncilMemberDataListItem[] = await response.json();
    return parsed;
  }
}

export const membersService = new MemberService();
