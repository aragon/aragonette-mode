/**
 * This file contains the data for the council members.
 * @param {string} address - The Ethereum address of the council member.
 * @param {string} name - The name of the council member, can be a real name or a pseudonym or left empty to use the address.
 * @param {string} bio - A short, optional biography of the council member.
 */
export type ICouncilMemberDataListItem = {
  address: string;
  name?: string;
  bio?: string;
};

export const COUNCIL_MEMBERS: ICouncilMemberDataListItem[] = [
  { address: "0x8bF1e340055c7dE62F11229A149d3A1918de3d74" },
];
