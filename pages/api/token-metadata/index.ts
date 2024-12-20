import type { NextApiRequest, NextApiResponse } from "next";

type TokenMetadataRequest = {
  tokenAddress: string;
};

export type TokenMetadataResponse = {
  circulating_market_cap: string;
  icon_url: string;
  name: string;
  decimals: string;
  symbol: string;
  address: string;
  type: string;
  holders: string;
  exchange_rate: string;
  total_supply: string;
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
    const response = await fetch(
      `https://explorer.mode.network/api/v2/tokens/0xd988097fb8612cc24eeC14542bC03424c656005f`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (response.status === 404) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    if (response.status === 400) {
      return res.status(400).json({
        message: "Invalid token address",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as TokenMetadataResponse;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "An error occurred while fetching token metadata",
    });
  }
}
