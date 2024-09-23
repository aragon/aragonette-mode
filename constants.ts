import { type Address } from "viem";
import { type ChainName, getChain } from "./utils/chains";

// Contract Addresses
export const PUB_DAO_ADDRESS = (process.env.NEXT_PUBLIC_DAO_ADDRESS ?? "") as Address;
export const PUB_MODE_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_MODE_TOKEN_ADDRESS ?? "") as Address;
export const PUB_BPT_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_BPT_TOKEN_ADDRESS ?? "") as Address;

export const PUB_LOCK_TO_VOTE_PLUGIN_ADDRESS = (process.env.NEXT_PUBLIC_LOCK_TO_VOTE_PLUGIN_ADDRESS ?? "") as Address;
export const PUB_TOKEN_VOTING_PLUGIN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_VOTING_PLUGIN_ADDRESS ?? "") as Address;

// Target chain
export const PUB_CHAIN_NAME = (process.env.NEXT_PUBLIC_CHAIN_NAME ?? "holesky") as ChainName;
export const PUB_CHAIN = getChain(PUB_CHAIN_NAME);

// ENS target chain
export const PUB_ENS_CHAIN_NAME = (process.env.NEXT_PUBLIC_ENS_CHAIN_NAME ?? "mainnet") as ChainName;
export const PUB_ENS_CHAIN = getChain(PUB_ENS_CHAIN_NAME);

// Contracts
export const MODE_ESCROW_CONTRACT = (process.env.NEXT_PUBLIC_MODE_ESCROW_CONTRACT ?? "") as Address;
export const MODE_TOKEN_CONTRACT = (process.env.NEXT_PUBLIC_MODE_TOKEN_CONTRACT ?? "") as Address;

export const BPT_ESCROW_CONTRACT = (process.env.NEXT_PUBLIC_BPT_ESCROW_CONTRACT ?? "") as Address;
export const BPT_TOKEN_CONTRACT = (process.env.NEXT_PUBLIC_BPT_TOKEN_CONTRACT ?? "") as Address;

// Network and services
export const PUB_ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";

export const PUB_WEB3_ENDPOINT = process.env.NEXT_PUBLIC_WEB3_URL_PREFIX ?? "";
export const PUB_WEB3_ENS_ENDPOINT = (process.env.NEXT_PUBLIC_WEB3_ENS_URL_PREFIX ?? "") + PUB_ALCHEMY_API_KEY;

export const PUB_ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ?? "";

export const PUB_WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const PUB_IPFS_ENDPOINTS = process.env.NEXT_PUBLIC_IPFS_ENDPOINTS ?? "";
export const PUB_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT ?? "";

// General
export const PUB_APP_NAME = "Mode Governance Hub";
export const PUB_APP_DESCRIPTION = "The place for all things Mode Governance.";
export const PUB_PROJECT_LOGO = "/mode-green.svg";

export const PUB_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
export const PUB_SOCIAL_IMAGE = process.env.NEXT_PUBLIC_SOCIAL_IMAGE ?? PUB_BASE_URL + "/og";
export const PUB_DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.com/invite/modenetworkofficial";
export const PUB_X_HANDLE = process.env.NEXT_PUBLIC_X_HANDLE ?? "@modenetwork";

export const PUB_PROJECT_URL = process.env.NEXT_PUBLIC_PROJECT_URL ?? "https://gov.mode.network/";
export const PUB_BLOG_URL = "https://mode.mirror.xyz/";
export const PUB_STAKING_LEARN_MORE_URL = "https://mode.mirror.xyz/";
export const PUB_VE_TOKENS_LEARN_MORE_URL = "https://mode.mirror.xyz/";
export const PUB_GET_MORE_MODE_URL =
  process.env.NEXT_PUBLIC_GET_MORE_MODE_URL ??
  "https://jumper.exchange/?fromChain=1&fromToken=0x0000000000000000000000000000000000000000&toChain=34443&toToken=0xDfc7C877a950e49D2610114102175A06C2e3167a";
export const PUB_GET_MORE_BPT_URL =
  process.env.NEXT_PUBLIC_GET_MORE_BPT_URL ?? "https://app.balancer.fi/#/ethereum/swap";
export const PUB_GET_MORE_BOTH_URL = process.env.NEXT_PUBLIC_GET_MORE_BOTH_URL ?? "https://web3packs.com/shop";

export const PUB_WALLET_ICON =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_ICON ??
  "https://cdn.prod.website-files.com/64c906a6ed3c4d809558853b/64d0b11158be9cdd5c89a2fe_webc.png";

export const EPOCH_DURATION = 1000 * 60 * 60 * 24 * 7 * 2;
