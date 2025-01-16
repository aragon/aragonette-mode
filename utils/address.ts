import { isAddress, type Address } from "viem";

export const shortenAddress = (address: Address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function isStringAddress(value: unknown): boolean {
  return typeof value === "string" && isAddress(value);
}
