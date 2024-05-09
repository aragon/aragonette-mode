import { useState, useEffect } from "react";
import { type AbiFunction, type Hex, decodeFunctionData, toFunctionSelector, type Address } from "viem";
import { useAbi } from "./useAbi";
import { type Action } from "@/utils/types";

export function useAction(action: Action) {
  const { abi, isLoading } = useAbi(action.to as Address);
  const [functionName, setFunctionName] = useState<string | null>(null);
  const [functionAbi, setFunctionAbi] = useState<AbiFunction | null>(null);
  const [actionArgs, setActionArgs] = useState<EvmValue[]>([]);

  useEffect(() => {
    if (isLoading) return;

    const { args, functionAbi, functionName } = decodeActionData(abi, action);
    setActionArgs(args);
    setFunctionAbi(functionAbi);
    setFunctionName(functionName);
  }, [abi, action, isLoading]);

  return {
    isLoading,
    functionName,
    functionAbi,
    args: actionArgs,
  };
}

type EvmValue = string | Hex | Address | number | bigint | boolean;

export interface DecodedAction {
  functionName: string | null;
  functionAbi: AbiFunction | null;
  args: EvmValue[];
}

export function decodeActionData(abi: AbiFunction[], action: Action): DecodedAction {
  const hexSelector = action.data.slice(0, 10) as Hex;
  const functionAbi = abi.find((item) => item.type === "function" && hexSelector === toFunctionSelector(item));

  if (!functionAbi || functionAbi.type !== "function") {
    return { functionName: null, functionAbi: null, args: [] };
  }

  const { args, functionName } = decodeFunctionData({
    abi,
    data: action.data as Hex,
  });

  return {
    functionName,
    functionAbi,
    args: args as EvmValue[],
  };
}
