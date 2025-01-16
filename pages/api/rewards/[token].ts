import { type NextApiRequest, type NextApiResponse } from "next";
import { parse, ValiError } from "valibot";
import { type ProposalDatum, ProposalSchema } from "@/server/utils/api/types";

type ApiResponse =
  | {
      data: ProposalDatum[];
      error?: never;
    }
  | {
      data?: never;
      error: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const { token } = req.query;

    if (token !== "mode" && token !== "bpt") {
      return res.status(400).json({
        error: 'Invalid token type. Must be either "mode" or "bpt"',
      });
    }

    const endpoint = token === "mode" ? "mode" : "mode-bpt";

    const response = await fetch(`${process.env.HIDDEN_HAND_ENDPOINT}/proposal/${endpoint}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    try {
      const parsedData = parse(ProposalSchema, data);
      res.status(200).json({ data: parsedData.data });
    } catch (error) {
      if (error instanceof ValiError) {
        res.status(422).json({
          error: `Validation failed: ${error.message}`,
        });
      } else {
        throw error;
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
    res.status(500).json({ error: errorMessage });
  }
}
