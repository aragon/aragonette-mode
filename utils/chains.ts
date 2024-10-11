import {
  polygon,
  mainnet,
  sepolia,
  holesky,
  arbitrum,
  polygonMumbai,
  mode,
  modeTestnet,
  anvil,
  type Chain,
} from "@wagmi/core/chains";

const chainNames = [
  "mainnet",
  "polygon",
  "sepolia",
  "holesky",
  "mumbai",
  "arbitrum",
  "mode",
  "mode-sepolia",
  "anvil",
] as const;

export type ChainName = (typeof chainNames)[number];

export function getChain(chainName: ChainName): Chain {
  switch (chainName) {
    case "mainnet":
      return mainnet;
    case "polygon":
      return polygon;
    case "arbitrum":
      return arbitrum;
    case "sepolia":
      return sepolia;
    case "holesky":
      return holesky;
    case "mumbai":
      return polygonMumbai;
    case "mode":
      return mode;
    case "mode-sepolia":
      return modeTestnet;
    case "anvil":
      return anvil;
    default:
      throw new Error("Unknown chain");
  }
}
