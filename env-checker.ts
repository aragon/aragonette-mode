import { type Address, getAddress } from "viem";
import { cleanEnv, str, url, makeValidator } from "envalid";
import { logger } from "./services/logger";

const address = makeValidator<Address>((input: string) => {
  try {
    return getAddress(input);
  } catch (e) {
    throw new Error(`Invalid address: ${input}`);
  }
});

logger.info("Checking environment variables...");

const checkEnvVar = {
  NEXT_PUBLIC_TOKEN_ADDRESS: address(),
  NEXT_PUBLIC_TOKEN_SYMBOL: str({ devDefault: "MTTK" }),
  NEXT_PUBLIC_CHAIN_NAME: str({ devDefault: "sepolia" }), // Default to sepolia chain
  NEXT_PUBLIC_WEB3_URL_PREFIX: str(),
  NEXT_PUBLIC_ALCHEMY_API_KEY: str(),
  NEXT_PUBLIC_ETHERSCAN_API_KEY: str(),
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: str(),
  NEXT_PUBLIC_IPFS_ENDPOINT: url(),
  NEXT_PUBLIC_IPFS_API_KEY: str(),
  NEXT_PUBLIC_API_BASE_URL: url({ devDefault: "http://localhost:3000/api" }),
  NEXT_PUBLIC_BASE_URL: url({ devDefault: "http://localhost:3000/" }),
  NEXT_PUBLIC_SNAPSHOT_SPACE: str(),
  PROPOSAL_PREFIX: str({ devDefault: "AIP" }),
  EMERGENCY_PREFIX: str({ devDefault: "SOS" }),
  SNAPSHOT_API_URL: url({ devDefault: "https://testnet.hub.snapshot.org/graphql" }),
  SNAPSHOT_API_KEY: str({ devDefault: "" }), //TODO: Optional while we don't have an API key
  SNAPSHOT_URL: url({ devDefault: "https://testnet.snapshot.org/" }),
  SNAPSHOT_TEST_HUB: url({ devDefault: "https://testnet.hub.snapshot.org" }), //TODO: Needed??
  DISCORD_URL: str({ devDefault: "https://discord.com" }),
  NEXT_PUBLIC_APP_NAME: str({ devDefault: "Mode Governance Hub" }),
  NEXT_PUBLIC_APP_DESCRIPTION: str({ devDefault: "Streamlined user interface for Mode governance" }),
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_URL: url({ devDefault: "https://gov.mode.network/" }),
  NEXT_PUBLIC_WALLET_CONNECT_ICON: url({
    devDefault: "https://cdn.prod.website-files.com/64c906a6ed3c4d809558853b/64d0b11158be9cdd5c89a2fe_webc.png",
  }),
};

// Validate environment variables
cleanEnv(process.env, checkEnvVar);

logger.info("Environment variables are correct!");
