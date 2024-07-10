import { PUB_API_BASE_URL } from "@/constants";
import { printStageParam, type IVotingPower } from "@/features/proposals";
import {
  type ICouncilMemberDataListItem,
  type IDelegateDataListItem,
  type IVoterVotingActivity,
} from "@/server/client/types/domain";
import { encodeSearchParams } from "@/utils/query";
import { type IPaginatedResponse } from "@/utils/types";
import type {
  IFetchCouncilMembersParams,
  IFetchDelegatesParams,
  IFetchDelegationsParams,
  IFetchVotingActivityParams,
  IFetchVotingPowerParams,
} from "./params";

class MemberService {
  private endpoint = `${PUB_API_BASE_URL}/delegates`;

  async fetchCouncilMembers(params: IFetchCouncilMembersParams): Promise<ICouncilMemberDataListItem[]> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/councilMembers`, params);
    const response = await fetch(url);
    const parsed: ICouncilMemberDataListItem[] = await response.json();
    return parsed;
  }

  async fetchDelegates(params: IFetchDelegatesParams): Promise<IPaginatedResponse<IDelegateDataListItem>> {
    const url = encodeSearchParams(this.endpoint, params);
    const response = await fetch(url);
    const parsed: IPaginatedResponse<IDelegateDataListItem> = await response.json();
    return parsed;
  }

  async fetchVotingActivity(params: IFetchVotingActivityParams): Promise<IPaginatedResponse<IVoterVotingActivity>> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/votingActivity`, {
      ...params,
      stage: printStageParam(params.stage),
    });

    const response = await fetch(url);
    const parsed: IVoterVotingActivity[] = await response.json();

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

  async fetchDelegationsReceived(params: IFetchDelegationsParams): Promise<IPaginatedResponse<IDelegateDataListItem>> {
    const url = encodeSearchParams(`${this.endpoint}/delegators`, params);
    const response = await fetch(url);

    const parsed: IPaginatedResponse<IDelegateDataListItem> = await response.json();
    return parsed;
  }

  async fetchVotingPower(params: IFetchVotingPowerParams): Promise<IVotingPower> {
    const url = encodeSearchParams(`${PUB_API_BASE_URL}/votingPower`, {
      ...params,
      stage: printStageParam(params.stage),
    });

    const response = await fetch(url);
    const parsed: IVotingPower = await response.json();
    return parsed;
  }
}

export const membersService = new MemberService();
