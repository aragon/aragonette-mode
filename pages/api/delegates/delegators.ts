import { getDelegators } from "@/features/membership/services/members/delegates-builder";
import { checkParam } from "@/utils/api-utils";
import { type IError } from "@/utils/types";
import { type NextApiRequest, type NextApiResponse } from "next/types";

export type IDelegators = {
  address: string;
  vp: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<IDelegators[] | IError>) {
  const { address } = req.query;
  const delegate = checkParam(address, "address");

  try {
    const delegators = await getDelegators(delegate);

    res.status(200).json(delegators);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
