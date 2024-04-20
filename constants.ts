import { type Address } from "viem";
import { type ChainName, getChain } from "./utils/chains";

// Contract Addresses
export const PUB_DAO_ADDRESS = (process.env.NEXT_PUBLIC_DAO_ADDRESS ?? "") as Address;
export const PUB_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") as Address;

// Target chain
export const PUB_CHAIN_NAME = (process.env.NEXT_PUBLIC_CHAIN_NAME ?? "sepolia") as ChainName;
export const PUB_CHAIN = getChain(PUB_CHAIN_NAME);

// Network and services
export const PUB_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export const PUB_WEB3_ENDPOINT = (process.env.NEXT_PUBLIC_WEB3_URL_PREFIX ?? "") + PUB_ALCHEMY_API_KEY;

export const PUB_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

export const PUB_WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const PUB_IPFS_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_ENDPOINT ?? "";
export const PUB_IPFS_API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY ?? "";

// Github
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
export const GITHUB_API_URL = process.env.GITHUB_API_URL ?? "https://api.github.com";
export const GITHUB_USER = process.env.GITHUB_USER ?? "";
export const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
export const GITHUB_PATH = process.env.GITHUB_PATH ?? "";

// Snapshot
export const SNAPSHOT_API_URL = process.env.SNAPSHOT_API_URL ?? "https://hub.snapshot.org/graphql";
export const SNAPSHOT_SPACE = process.env.SNAPSHOT_SPACE ?? "";

// General
export const PUB_APP_NAME = "Polygon Governance Hub";
export const PUB_APP_DESCRIPTION = "Streamlined user interface for Polygon governance";

export const PUB_PROJECT_URL = "https://polygon.technology/";
export const PUB_WALLET_ICON = "https://avatars.githubusercontent.com/u/30753617";

export const PUB_DISCORD_URL = "https://discord.com/";
