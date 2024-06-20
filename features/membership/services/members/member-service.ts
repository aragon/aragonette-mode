import { PUB_API_BASE_URL } from "@/constants";
import { type IDelegateVotingActivity } from "@/pages/api/delegates/votingActivity";
import { encodeSearchParams } from "@/utils/query";
import { type IPaginatedResponse } from "@/utils/types";
import { type ICouncilMember, type IMemberDataListItem } from "./domain";
import type {
  IFetchCouncilMembersParams,
  IFetchDelegatesParams,
  IFetchDelegationsParams,
  IFetchVotingActivityParams,
} from "./params";

class MemberService {
  private endpoint = `${PUB_API_BASE_URL}/delegates`;

  async fetchCouncilMembers(params: IFetchCouncilMembersParams): Promise<IMemberDataListItem[]> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/councilMembers`, params);
    const response = await fetch(url);
    const parsed: ICouncilMember[] = await response.json();
    return parsed;
  }

  async fetchDelegates(params: IFetchDelegatesParams): Promise<IPaginatedResponse<IMemberDataListItem>> {
    const url = encodeSearchParams(this.endpoint, params);
    const response = await fetch(url);
    const parsed: IPaginatedResponse<IMemberDataListItem> = await response.json();
    return parsed;
  }

  async fetchVotingActivity(params: IFetchVotingActivityParams): Promise<IPaginatedResponse<IDelegateVotingActivity>> {
    const url = encodeSearchParams(`${this.endpoint}/votingActivity`, params);

    const response = await fetch(url);
    const parsed: IDelegateVotingActivity[] = await response.json();

    return {
      data: parsed,
      pagination: {
        total: parsed.length,
        page: params.page ?? 1,
        pages: Math.ceil(parsed.length / (params.limit ?? 3)),
        limit: params.limit ?? parsed.length,
      },
    };
  }

  async fetchDelegationsReceived(params: IFetchDelegationsParams): Promise<IPaginatedResponse<IMemberDataListItem>> {
    const url = encodeSearchParams(`${this.endpoint}/delegators`, params);
    const response = await fetch(url);

    const parsed: IMemberDataListItem[] = await response.json();

    return {
      data: parsed,
      pagination: {
        total: parsed.length,
        page: params.page ?? 1,
        pages: Math.ceil(parsed.length / (params.limit ?? 12)),
        limit: params.limit ?? parsed.length,
      },
    };
  }
}

export const membersService = new MemberService();
