import { getDelegators } from "@/server/composers/delegates-builder";
import { checkParam, checkNullableParam } from "@/server/utils";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import { type NextApiRequest, type NextApiResponse } from "next/types";
import { type IDelegator } from "@/features/membership/services/members/domain";
import { parsePaginationParams } from "@/utils/pagination";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IDelegator> | IError>
) {
  const { address, page, limit } = req.query;

  const delegate = checkParam(address, "address");
  const parsedPage = checkNullableParam(page, "page");
  const parsedLimit = checkNullableParam(limit, "limit");

  const { page: pageInt, limit: limitInt } = parsePaginationParams(parsedPage, parsedLimit);

  try {
    const delegators = await getDelegators(delegate, pageInt, limitInt);

    res.status(200).json(delegators);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
