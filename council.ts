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
  {
    name: "Alice Johnson",
    address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    bio: "Expert in blockchain technology with over a decade of experience.",
  },
  {
    address: "0x2a3b4c5d6e7f8a9b0c1d2e3f4b5a6c7d8e9f0a1b",
    bio: "Cybersecurity specialist focusing on securing decentralized systems.",
  },
  {
    name: "CryptoKing",
    address: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    bio: "DeFi pioneer known for innovative smart contract solutions.",
  },
  {
    name: "EtherealDream",
    address: "0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    bio: "Smart contracts expert with a focus on Ethereum development.",
  },
  {
    name: "SatoshiLite",
    address: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    bio: "Cryptocurrency legend and advocate for decentralized finance.",
  },
  { address: "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf" },
  { address: "0x8bF1e340055c7dE62F11229A149d3A1918de3d74" },
  { address: "0x35911Cc89aaBe7Af6726046823D5b678B6A1498d" },
  { address: "0x376c649111543C46Ce15fD3a9386b4F202A6E06c" },
  { address: "0x2777abb318C8F98470Cd5eB5d9bc9fA595c2af3A" },
];
