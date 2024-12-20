import { type NextApiRequest, type NextApiResponse } from "next";
import { parse, ValiError } from "valibot";
import { RewardSchema, type Reward } from "@/server/utils/api/types";
import { type Address } from "viem";

export type ErrorData = {
  message: string;
};

export type UserAddressRequest = {
  userAddress: Address;
};

const fakeRewards: Reward = {
  error: false,
  data: [
    {
      symbol: "usdc",
      name: "USD Coin",
      token: "0xd988097fb8612cc24eeC14542bC03424c656005f",
      decimals: 6,
      chainId: 1,
      protocol: "balancer",
      claimable: "43.237907",
      cumulativeAmount: "43237907",
      value: 43.237907,
      activeTimer: 0,
      pausedTimer: 0,
      claimMetadata: {
        identifier: "0x014b2de4bccb717cde8df052cfe36456d7970905932f4bdcc43d9bb0fc6d1b7d",
        account: "0x1b30ac2c41c5ee7921104ee4a4242555e9905d8a",
        amount: "43237907",
        merkleProof: [
          "0x327261a909c48636f53bccf2ee4b88dcaaca83dfc6d774cce27bd8d4b65b55ee",
          "0xd3ac2fc583c9e7c6a1152cbced836030beb38fba1f1bb54ad31932c52e447be0",
          "0x1f0a8a35b782737398a087aac8c97a24cbe1654d661bc0361e754d85fa0f4246",
          "0x7ad0e6b50e6cc5eb4b823bb80c95fa711c1cf4a85496779a2ded9110bfb9dbd8",
          "0xa906fe7fc6026cea2dcee43576392fcbfcdf4dfbf4c3cafd63bf6bacbfd66464",
          "0xcd97473f747e57854424573d26b0b2f1fa283e5ccb7211ab6b9aa9dac7e2ac05",
          "0x77cdaf71f9d7c45d1cb75cd187122f083470bb6d81dac5304d7c67a2de6ccb34",
          "0x6692566e50af4ec3dd4bded7ffe51f5f15a32fc04d2f3aa60dbef9ace1a55c2e",
          "0x05c533940de57df79c0d81e7642424ec91c5f882d0e1f0f676c01ad7a9270e2e",
        ],
      },
    },
  ],
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

    const response = await fetch(`${process.env.HIDDEN_HAND_ENDPOINT}/reward/1/${userAddress}`, {
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
      res.status(200).json(fakeRewards);
    } catch (validationError) {
      if (validationError instanceof ValiError) {
        res.status(422).json({
          message: `Validation failed: ${validationError.message}`,
        });
      } else {
        throw validationError;
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";

    res.status(500).json({
      message: errorMessage,
    });
  }
}
