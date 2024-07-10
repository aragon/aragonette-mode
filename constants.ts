import { type Address } from "viem";
import { type ChainName, getChain } from "./utils/chains";

// Contract Addresses
export const PUB_DAO_ADDRESS = (process.env.NEXT_PUBLIC_DAO_ADDRESS ?? "") as Address;
export const PUB_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") as Address;
export const PUB_TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL ?? "";
export const PUB_MULTISIG_ADDRESS = (process.env.NEXT_PUBLIC_MULTISIG_ADDRESS ?? "") as Address;
export const PUB_DELEGATION_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_DELEGATION_CONTRACT_ADDRESS ?? "") as Address;

// Target chain
export const PUB_CHAIN_NAME = (process.env.NEXT_PUBLIC_CHAIN_NAME ?? "sepolia") as ChainName;
export const PUB_CHAIN = getChain(PUB_CHAIN_NAME);
export const PUB_ENS_CHAIN_NAME = (process.env.NEXT_PUBLIC_ENS_CHAIN_NAME ?? "sepolia") as ChainName;
export const PUB_ENS_CHAIN = getChain(PUB_ENS_CHAIN_NAME);

// Network and services
export const PUB_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export const PUB_WEB3_ENDPOINT = (process.env.NEXT_PUBLIC_WEB3_URL_PREFIX ?? "") + PUB_ALCHEMY_API_KEY;

export const PUB_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

export const PUB_WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const PUB_IPFS_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_ENDPOINT ?? "";
export const PUB_IPFS_API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY ?? "";

export const PUB_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
export const PUB_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000/";

// Github
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";
export const GITHUB_API_URL = process.env.GITHUB_API_URL ?? "https://api.github.com";
export const GITHUB_USER = process.env.GITHUB_USER ?? "";
export const GITHUB_REPO = process.env.GITHUB_REPO ?? "";
export const GITHUB_PIPS_PATH = process.env.GITHUB_PIPS_PATH ?? "";
export const GITHUB_TRANSPARENCY_REPORTS_PATH = process.env.GITHUB_TRANSPARENCY_REPORTS_PATH ?? "";
export const GITHUB_COUNCIL_FILENAME = process.env.GITHUB_COUNCIL_FILENAME ?? "";
export const GITHUB_FEATURED_DELEGATES_FILENAME = process.env.GITHUB_FEATURED_DELEGATES_FILENAME ?? "";

// Snapshot
export const SNAPSHOT_API_URL = process.env.SNAPSHOT_API_URL ?? "https://hub.snapshot.org/graphql";
export const SNAPSHOT_API_KEY = process.env.SNAPSHOT_API_KEY ?? "";
export const SNAPSHOT_SPACE = process.env.NEXT_PUBLIC_SNAPSHOT_SPACE ?? "test-ens.eth";
export const SNAPSHOT_URL = "https://testnet.snapshot.org/";
export const SNAPSHOT_TEST_HUB = "https://testnet.hub.snapshot.org";

// General
export const PUB_APP_NAME = "Polygon Governance Hub";
export const PUB_APP_DESCRIPTION = "Streamlined user interface for Polygon governance";

export const PUB_PROJECT_URL = "https://polygon.technology/";
export const PUB_WALLET_ICON = "https://avatars.githubusercontent.com/u/30753617";

export const PUB_DISCORD_URL = "https://discord.com/";
export const EMERGENCY_PREFIX = process.env.EMERGENCY_PREFIX ?? "SOS";
