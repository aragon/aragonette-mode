// import { PUB_API_BASE_URL } from "@/constants";
// import { encodeSearchParams } from "@/utils/query";
import { type IPaginatedResponse } from "@/utils/types";
import { type IDelegateListItem, type ICouncilMemberListItem } from "./domain";
import type { IFetchCouncilMembersParams, IFetchDelegatesParams } from "./params";
import { zeroAddress } from "viem";

const addresses = [
  { address: "0xc1d60f584879f024299DA0F19Cdb47B931E35b53" },
  { address: zeroAddress },
  { address: "0x3Eb470445Fb558f4925187D9deEC1BfF6cC124E8" },
  { address: zeroAddress },
  { address: "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf" },
  { address: zeroAddress },
  { address: "0x8bF1e340055c7dE62F11229A149d3A1918de3d74" },
  { address: zeroAddress },
  { address: "0x376c649111543C46Ce15fD3a9386b4F202A6E06c" },
  { address: zeroAddress },
  { address: "0x35911Cc89aaBe7Af6726046823D5b678B6A1498d" },
  { address: zeroAddress },
  { address: "0x35911Cc89aaBe7Af6726046823D5b678B6A1498d" },
];

class MemberService {
  async fetchCouncilMembers(params: IFetchCouncilMembersParams): Promise<IPaginatedResponse<ICouncilMemberListItem>> {
    // const url = encodeSearchParams(`${PUB_API_BASE_URL}/members`, params);
    // const response = await fetch(url);
    // const parsed: IPaginatedResponse<IMember> = await response.json();
    // return parsed;

    // NOTE: if sorting on frontend, all data should be returned and
    // values will be sorted and paginated on frontend
    return {
      pagination: {
        total: addresses.length,
        page: params.page ?? 1,
        pages: Math.ceil(addresses.length / (params.limit ?? 12)),
        limit: params.limit ?? 12,
      },
      data: addresses,
    };
  }

  async fetchDelegates(params: IFetchDelegatesParams): Promise<IPaginatedResponse<IDelegateListItem>> {
    // const url = encodeSearchParams(`${PUB_API_BASE_URL}/delegates`, params);
    // const response = await fetch(url);
    // const parsed: IPaginatedResponse<IMember> = await response.json();
    // return parsed;

    // NOTE: if sorting on frontend, all data should be returned and
    // values will be sorted and paginated on frontend
    const dummyMembers = [...addresses, ...addresses];
    return {
      pagination: {
        total: dummyMembers.length,
        page: params.page ?? 1,
        pages: Math.ceil(dummyMembers.length / (params.limit ?? 12)),
        limit: params.limit ?? 12,
      },
      data: dummyMembers.map((m) => ({
        ...m,
        votingPower: Math.random() * 10000,
        delegationCount: Math.ceil(Math.random() * 100),
      })),
    };
  }
}

export const membersService = new MemberService();
