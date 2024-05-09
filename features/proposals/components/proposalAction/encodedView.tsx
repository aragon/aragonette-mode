import { type Action } from "@/utils/types";
import { InputText, NumberFormat, formatterUtils } from "@aragon/ods";
import { formatEther } from "viem";

type IEncodedViewProps = {
  rawAction: Action;
};

export const EncodedView: React.FC<IEncodedViewProps> = (props) => {
  const { rawAction } = props;

  return getEncodedArgs(rawAction).map((arg) => (
    <div className="flex" key={arg.title}>
      <InputText addon={arg.title} addonPosition="left" readOnly={true} value={arg.value} className="w-full" />
    </div>
  ));
};

function getEncodedArgs(action: Action) {
  const isEthTransfer = !action.data || action.data === "0x";

  if (isEthTransfer) {
    return [
      { title: "To", value: action.to },
      {
        title: "Value",
        value: `${formatterUtils.formatNumber(formatEther(action.value, "wei"), { format: NumberFormat.TOKEN_AMOUNT_SHORT })} ETH`,
      },
    ];
  }

  return Object.entries(action).map(([key, value]) => ({ title: key, value: value.toString() }));
}
