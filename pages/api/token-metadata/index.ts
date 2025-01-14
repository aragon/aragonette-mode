import supportedRewardTokens from "@/utils/supported-reward-tokens";
import type { NextApiRequest, NextApiResponse } from "next";

type TokenMetadataRequest = {
  tokenAddress: string;
};

export type TokenMetadataResponse = {
  address: string;
  decimals: string;
  icon_url: string | undefined;
  name: string;
  symbol: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenMetadataResponse | { message: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { tokenAddress } = req.body as TokenMetadataRequest;

  if (!tokenAddress) {
    return res.status(400).json({ message: "Token address is required" });
  }

  try {
    const token = supportedRewardTokens.find((token) => token.address.toLowerCase() === tokenAddress.toLowerCase());

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while fetching token metadata",
    });
  }
}
