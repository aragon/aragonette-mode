import { getDelegators } from "@/features/membership/services/members/delegates-builder";
import { checkParam, checkNullableParam } from "@/utils/api-utils";
import { type IError, type IPaginatedResponse } from "@/utils/types";
import { type NextApiRequest, type NextApiResponse } from "next/types";
import { type IDelegator } from "@/features/membership/services/members/domain";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IPaginatedResponse<IDelegator> | IError>
) {
  const { address, page, limit } = req.query;

  const delegate = checkParam(address, "address");
  const parsedPage = checkNullableParam(page, "page");
  const parsedLimit = checkNullableParam(limit, "limit");

  let pageInt = parseInt(parsedPage ?? "1", 10);
  let limitInt = parseInt(parsedLimit ?? "10", 10);

  if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) {
    limitInt = 10;
  }

  if (isNaN(pageInt) || pageInt < 1) {
    pageInt = 1;
  }

  try {
    const delegators = await getDelegators(delegate, pageInt, limitInt);

    res.status(200).json(delegators);
  } catch (error) {
    res.status(500).json({ error: { message: "Server error" } });
  }
}
