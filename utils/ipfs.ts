import { PUB_IPFS_ENDPOINT, PUB_IPFS_API_KEY } from "@/constants";
import { logger } from "@/services/logger";
import { CID, IPFSHTTPClient } from "ipfs-http-client";
import { Hex, fromHex } from "viem";

export function fetchJsonFromIpfs(ipfsUri: string) {
  return fetchFromIPFS(ipfsUri).then((res) => res.json());
}

export function uploadToIPFS(client: IPFSHTTPClient, blob: Blob) {
  return client.add(blob).then(({ cid }: { cid: CID }) => {
    return "ipfs://" + cid.toString();
  });
}

async function fetchFromIPFS(ipfsUri: string): Promise<Response> {
  if (!ipfsUri) throw new Error("Invalid IPFS URI");
  else if (ipfsUri.startsWith("0x")) {
    // fallback
    ipfsUri = fromHex(ipfsUri as Hex, "string");

    if (!ipfsUri) throw new Error("Invalid IPFS URI");
  }

  const path = resolvePath(ipfsUri);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(`${PUB_IPFS_ENDPOINT}/${path}`, {
    method: "GET",
    signal: controller.signal,
  });
  clearTimeout(id);
  if (!response.ok) {
    throw new Error(`IPFS error: ${response.statusText}`);
  }
  return response; // .json(), .text(), .blob(), etc.
}

function resolvePath(uri: string) {
  const cid = uri.includes("ipfs://") ? uri.substring(7) : uri;
  if (!cid.length) throw new Error("Invalid IPFS URI");
  const isNotAscii = cid.split("").some((char) => char.charCodeAt(0) > 127);
  if (!isNotAscii) throw new Error("Invalid IPFS URI");
  return cid;
}
