import { type IVotingPower } from "@/features/proposals";
import { buildVotingPowerResponse } from "@/features/proposals/providers/utils/votes-builder";
import { checkParam, parseStageParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAddress } from "viem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<IVotingPower | IError>) {
  const { stage, address } = req.query;

  try {
    const parsedStage = checkParam(stage, "stage");
    const stageEnum = parseStageParam(parsedStage);
    const parsedAddress = checkParam(address, "address");

    if (!isAddress(parsedAddress, { strict: false })) {
      throw new Error("Invalid address parameter");
    }

    const vp = await buildVotingPowerResponse(stageEnum, parsedAddress);

    return res.status(200).json({ address: parsedAddress, vp });
  } catch (error: any) {
    res.status(400).json({ error: { message: error.message } });
  }
}
