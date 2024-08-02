import { type Address } from "viem";
import { type ChainName, getChain } from "./utils/chains";

// Contract Addresses
export const PUB_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") as Address;
export const PUB_TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL ?? "";

// Target chain
export const PUB_CHAIN_NAME = (process.env.NEXT_PUBLIC_CHAIN_NAME ?? "sepolia") as ChainName;
export const PUB_CHAIN = getChain(PUB_CHAIN_NAME);
export const PUB_ENS_CHAIN_NAME = (process.env.NEXT_PUBLIC_ENS_CHAIN_NAME ?? "mainnet") as ChainName;
export const PUB_ENS_CHAIN = getChain(PUB_ENS_CHAIN_NAME);

// Network and services
export const PUB_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export const PUB_WEB3_ENDPOINT = (process.env.NEXT_PUBLIC_WEB3_URL_PREFIX ?? "") + PUB_ALCHEMY_API_KEY;
export const PUB_WEB3_ENS_ENDPOINT = (process.env.NEXT_PUBLIC_WEB3_ENS_URL_PREFIX ?? "") + PUB_ALCHEMY_API_KEY;

export const PUB_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

export const PUB_WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const PUB_IPFS_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_ENDPOINT ?? "";
export const PUB_IPFS_API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY ?? "";

export const PUB_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
export const PUB_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000/";

// Snapshot
export const SNAPSHOT_API_URL = process.env.SNAPSHOT_API_URL ?? "https://hub.snapshot.org/graphql";
export const SNAPSHOT_API_KEY = process.env.SNAPSHOT_API_KEY ?? "";
export const SNAPSHOT_SPACE = process.env.NEXT_PUBLIC_SNAPSHOT_SPACE ?? "test-ens.eth";
export const SNAPSHOT_URL = "https://testnet.snapshot.org/";
export const SNAPSHOT_TEST_HUB = "https://testnet.hub.snapshot.org";

// Arweave and Paragraph
export const PUB_PARAGRAPH_PUBLICATION_SLUG = process.env.NEXT_PUBLIC_PARAGRAPH_PUBLICATION_SLUG ?? "";
export const PUB_ARWEAVE_API_URL = process.env.NEXT_PUBLIC_ARWEAVE_API_URL ?? "";

// Proposals
export const PROPOSAL_PREFIX = process.env.PROPOSAL_PREFIX ?? "MIP";
export const EMERGENCY_PREFIX = process.env.EMERGENCY_PREFIX ?? "SOS";

// Google Calendar
export const PUB_GOOGLE_CALENDAR_CALENDAR_ID = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CALENDAR_ID ?? "";
export const GOOGLE_CALENDAR_API_KEY = process.env.GOOGLE_CALENDAR_API_KEY ?? "";

// General
export const PUB_APP_NAME = "Mode Governance Hub";
export const PUB_APP_DESCRIPTION = "The place for all things Mode Governance.";

export const PUB_PROJECT_URL = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_URL ?? "https://gov.mode.network/";
export const PUB_WALLET_ICON =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_ICON ??
  "https://cdn.prod.website-files.com/64c906a6ed3c4d809558853b/64d0b11158be9cdd5c89a2fe_webc.png";

export const PUB_DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.com/invite/modenetworkofficial";
export const PUB_X_HANDLE = process.env.NEXT_PUBLIC_X_HANDLE ?? "@modenetwork";
