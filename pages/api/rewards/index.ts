import { type NextApiRequest, type NextApiResponse } from "next";
import { parse, ValiError } from "valibot";
import { type ProposalDatum, ProposalSchema } from "@/server/utils/api/types";

export type ErrorData = {
  error: string;
};

export default async function handler(_req: NextApiRequest, res: NextApiResponse<ProposalDatum[] | ErrorData>) {
  try {
    const response = await fetch(`${process.env.HIDDEN_HAND_ENDPOINT}/proposal/mode`, {
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
      const parsedDatum = parse(ProposalSchema, data);
      res.status(200).json(parsedDatum.data);
    } catch (validationError) {
      if (validationError instanceof ValiError) {
        res.status(422).json({
          error: `Validation failed: ${validationError.message}`,
        });
      } else {
        throw validationError;
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";

    res.status(500).json({
      error: errorMessage,
    });
  }
}
