// import { PUB_API_BASE_URL } from "@/constants";
// import { encodeSearchParams } from "@/utils/query";
import { type IPaginatedResponse } from "@/utils/types";
import { type IMember } from "./domain";
import type { IFetchCouncilMembersParams } from "./params";
import { zeroAddress } from "viem";

const dummyMembers = [
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
];

class MemberService {
  async fetchCouncilMembers(params: IFetchCouncilMembersParams): Promise<IPaginatedResponse<IMember>> {
    // const url = encodeSearchParams(`${PUB_API_BASE_URL}/members`, params);
    // const response = await fetch(url);
    // const parsed: IPaginatedResponse<IMember> = await response.json();
    // return parsed;
    return { pagination: { total: dummyMembers.length, page: 1, pages: 1, limit: 100 }, data: dummyMembers };
  }
}

export const membersService = new MemberService();
