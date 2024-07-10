export const checkParam = (param: string | string[] | undefined, name: string): string => {
  if (!param) {
    throw new Error(`Missing ${name} parameter`);
  }

  if (Array.isArray(param)) {
    throw new Error(`Invalid ${name} parameter`);
  }

  return param;
};

export const checkNullableParam = (param: string | string[] | undefined, name: string): string | undefined => {
  if (Array.isArray(param)) {
    throw new Error(`Invalid ${name} parameter`);
  }

  return param;
};
