import { fromHex, type Hex } from "viem";
import type { Metadata } from "./types";

const IPFS_FETCH_TIMEOUT = 30000; // 10 seconds
const PUB_IPFS_ENDPOINTS = "https://externalorgs.mypinata.cloud/ipfs";

export async function fetchIpfsAsJson(ipfsUri: string): Promise<Metadata> {
  const res = await fetchRawIpfs(ipfsUri);
  return await res.json();
}

export async function fetchRawIpfs(ipfsUri: string): Promise<Response> {
  console.time(`fetchRawIpfs ${ipfsUri}`);
  if (!ipfsUri) throw new Error("Invalid IPFS URI");
  else if (ipfsUri.startsWith("0x")) {
    // Convert hex string to UTF-8
    ipfsUri = fromHex(ipfsUri as Hex, "string");
    if (!ipfsUri) throw new Error("Invalid IPFS URI after hex conversion");
  }

  const uriPrefix = PUB_IPFS_ENDPOINTS;
  const cid = resolvePath(ipfsUri);

  const controller = new AbortController();
  const abortId = setTimeout(() => controller.abort(), IPFS_FETCH_TIMEOUT);
  try {
    console.time(`http-fetch ${uriPrefix}/${cid}`);
    const url = `${uriPrefix}/${cid}`;
    const response = await fetch(`${uriPrefix}/${cid}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(abortId);
    console.timeEnd(`http-fetch ${uriPrefix}/${cid}`);
    if (!response.ok) throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    console.timeEnd(`fetchRawIpfs ${ipfsUri}`);
    return response;
  } catch (error) {
    console.warn(`Failed to fetch from ${uriPrefix}: ${error}`);
    clearTimeout(abortId);
  }

  throw new Error("Could not connect to any of the IPFS endpoints");
}

function resolvePath(uri: string) {
  return uri.startsWith("ipfs://") ? uri.slice(7) : uri;
}
