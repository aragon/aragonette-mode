import { type Address, getAddress } from "viem";
import { cleanEnv, str, url, makeValidator } from "envalid";

const address = makeValidator<Address>((input: string) => {
  try {
    return getAddress(input);
  } catch (e) {
    throw new Error(`Invalid address: ${input}`);
  }
});

console.log("Checking environment variables...");

const checkEnvVar = {
  NEXT_PUBLIC_DAO_ADDRESS: address(),
  NEXT_PUBLIC_TOKEN_ADDRESS: address(),
  NEXT_PUBLIC_TOKEN_SYMBOL: str({ devDefault: "POL" }),
  NEXT_PUBLIC_MULTISIG_ADDRESS: address(),
  NEXT_PUBLIC_DELEGATION_CONTRACT_ADDRESS: address(),
  NEXT_PUBLIC_CHAIN_NAME: str({ devDefault: "sepolia" }), // Default to sepolia chain
  NEXT_PUBLIC_WEB3_URL_PREFIX: str(),
  NEXT_PUBLIC_ALCHEMY_API_KEY: str(),
  NEXT_PUBLIC_ETHERSCAN_API_KEY: str(),
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: str(),
  NEXT_PUBLIC_IPFS_ENDPOINT: url(),
  NEXT_PUBLIC_IPFS_API_KEY: str(),
  NEXT_PUBLIC_API_BASE_URL: url({ devDefault: "http://localhost:3000/api" }),
  NEXT_PUBLIC_BASE_URL: url({ devDefault: "http://localhost:3000/" }),
  GITHUB_TOKEN: str(),
  GITHUB_API_URL: url({ default: "https://api.github.com" }),
  GITHUB_USER: str(),
  GITHUB_REPO: str(),
  GITHUB_PIPS_PATH: str(),
  GITHUB_TRANSPARENCY_REPORTS_PATH: str(),
  GITHUB_COUNCIL_FILENAME: str(),
  GITHUB_FEATURED_DELEGATES_FILENAME: str(),
  NEXT_PUBLIC_SNAPSHOT_SPACE: str(),
  EMERGENCY_PREFIX: str({ devDefault: "SOS" }),
  SNAPSHOT_API_URL: url({ devDefault: "https://testnet.hub.snapshot.org/graphql" }),
  SNAPSHOT_API_KEY: str({ devDefault: "" }), //TODO: Optional while we don't have an API key
  SNAPSHOT_URL: url({ devDefault: "https://testnet.snapshot.org/" }),
  SNAPSHOT_TEST_HUB: url({ devDefault: "https://testnet.hub.snapshot.org" }), //TODO: Needed??
  DISCORD_URL: str({ devDefault: "https://discord.com" }),
  NEXT_PUBLIC_APP_NAME: str({ devDefault: "Polygon Governance Hub" }),
  NEXT_PUBLIC_APP_DESCRIPTION: str({ devDefault: "Streamlined user interface for Polygon governance" }),
  NEXT_PUBLIC_PROJECT_URL: url({ devDefault: "https://polygon.technology/" }),
  NEXT_PUBLIC_WALLET_ICON: url({ devDefault: "https://avatars.githubusercontent.com/u/30753617" }),
};

// Validate environment variables
cleanEnv(process.env, checkEnvVar);

console.log("Environment variables are correct!");
