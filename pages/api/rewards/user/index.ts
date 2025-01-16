import { type Reward, RewardSchema } from "@/server/utils/api/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { ValiError, parse } from "valibot";
import type { Address } from "viem";

export type ErrorData = {
  message: string;
};

export type UserAddressRequest = {
  userAddress: Address;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Reward | ErrorData>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userAddress } = req.body as UserAddressRequest;

  try {
    if (!userAddress || typeof userAddress !== "string") {
      return res.status(400).json({
        message: "Invalid or missing user parameter",
      });
    }

    const response = await fetch(`${process.env.HIDDEN_HAND_ENDPOINT}/reward/34443/${userAddress}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    try {
      const parsedRewards = parse(RewardSchema, data);
      res.status(200).json(parsedRewards);
    } catch (error) {
      if (error instanceof ValiError) {
        res.status(422).json({
          message: `Validation failed: ${error.message}`,
        });
      } else {
        throw error;
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    res.status(500).json({
      message: errorMessage,
    });
  }
}
