import { decodeCamelCase } from "@/utils/case";
import { InputText } from "@aragon/ods";
import { type AbiFunction } from "viem";
import { type CallParameterFieldType, resolveValue, resolveAddon } from "./decoderUtils";

interface ICallParamFiledProps {
  value: CallParameterFieldType;
  idx: number;
  functionAbi: AbiFunction | null;
}

export const CallParamField: React.FC<ICallParamFiledProps> = ({ value, idx, functionAbi }) => {
  if (functionAbi?.type !== "function") return;

  const resolvedValue = resolveValue(value, functionAbi.inputs?.[idx]);
  const addon =
    Array.isArray(functionAbi.inputs) && functionAbi.inputs.length > 1
      ? resolveAddon(functionAbi.inputs?.[idx].name ?? "", functionAbi.inputs?.[idx].type, idx)
      : undefined;

  return (
    <InputText
      className="w-full"
      addon={decodeCamelCase(addon)}
      value={resolvedValue}
      readOnly={true}
      addonPosition="left"
    />
  );
};
