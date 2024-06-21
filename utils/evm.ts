import { isAddress as isWeb3Address } from "viem";

export const isAddress = (maybeAddress: any) => {
  if (!maybeAddress || typeof maybeAddress !== "string") return false;
  else if (!maybeAddress.match(/^0x[0-9a-fA-F]{40}$/)) return false;
  return true;
};

export function formatHexString(address: string): string {
  if (!address || address.length < 12) {
    return address || "";
  }

  // Take the first 5 characters (including '0x') and the last 4 characters
  return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
}

/**
 * Compares two addresses (ignoring checksum) to see if they are the same
 * @param addressOne The first address
 * @param addressTwo The second address
 * @returns true if the addresses are the same, false otherwise
 */
export function isAddressEqual(addressOne = "", addressTwo = ""): boolean {
  return (
    isWeb3Address(addressOne, { strict: false }) &&
    isWeb3Address(addressTwo, { strict: false }) &&
    addressOne?.toLowerCase() === addressTwo?.toLowerCase()
  );
}
