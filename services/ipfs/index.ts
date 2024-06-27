import { PUB_IPFS_API_KEY, PUB_IPFS_ENDPOINT } from "@/constants";
import Cache from "../cache/VercelCache";
import { fromHex, type Hex } from "viem";
import { logger } from "../logger";

export async function fetchJsonFromIpfs(ipfsUri: string) {
  const cache = new Cache();
  const cachedResponse = await cache.get(ipfsUri);
  if (cachedResponse) {
    return cachedResponse;
  }

  const res = await fetchFromIPFS(ipfsUri);
  const data = res.json();
  await cache.set(ipfsUri, data);

  return data;
}

export function uploadToPinata(data: any): Promise<string> {
  const pinataData = {
    pinataOptions: {
      cidVersion: 1,
    },
    pinataContent: {
      ...data,
    },
  };

  return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PUB_IPFS_API_KEY}`,
      "Content-Type": "application/json",
      "x-pinata-origin": "sdk",
      "x-version": "2.1.1",
    },
    body: JSON.stringify(pinataData),
  })
    .then((res) => res.json())
    .then((json) => {
      return `ipfs://${json.IpfsHash}`;
    })
    .catch((err) => {
      throw new Error("Error pinning metadata", err);
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
  const response = await fetch(`${PUB_IPFS_ENDPOINT}/${path}`, {
    method: "GET",
  });

  if (!response.ok) {
    logger.error(`Failed to fetch IPFS data from ${ipfsUri}`);
    throw new Error("Failed to fetch IPFS data");
  }
  return response; // .json(), .text(), .blob(), etc.
}

function resolvePath(uri: string) {
  const path = uri.includes("ipfs://") ? uri.substring(7) : uri;
  return path;
}
