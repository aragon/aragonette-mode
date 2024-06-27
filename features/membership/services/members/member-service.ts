import { PUB_API_BASE_URL } from "@/constants";
import { encodeSearchParams } from "@/utils/query";
import { type IPaginatedResponse } from "@/utils/types";
import { type IVoterVotingActivity, type ICouncilMember, type IMemberDataListItem } from "./domain";
import type {
  IFetchCouncilMembersParams,
  IFetchDelegatesParams,
  IFetchDelegationsParams,
  IFetchVotingActivityParams,
  IFetchVotingPowerParams,
} from "./params";
import { type IVotingPower, printStageParam } from "@/features/proposals";

class MemberService {
  private endpoint = `${PUB_API_BASE_URL}/delegates`;

  async fetchCouncilMembers(params: IFetchCouncilMembersParams): Promise<ICouncilMember[]> {
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

  async fetchDelegationsReceived(params: IFetchDelegationsParams): Promise<IPaginatedResponse<IMemberDataListItem>> {
    const url = encodeSearchParams(`${this.endpoint}/delegators`, params);
    const response = await fetch(url);

    const parsed: IPaginatedResponse<IMemberDataListItem> = await response.json();
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
