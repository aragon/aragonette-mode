import { DataListItem, DateFormat, formatterUtils, NumberFormat } from "@aragon/ods";
import Image from "next/image";
import { formatUnits } from "viem";
import { useGetVp } from "../../hooks/useGetVp";
import { useTokenInfo } from "../../hooks/useTokenInfo";
import { Token } from "../../types/tokens";
import { type VeTokenItem } from "./types";
import { epochsSince } from "./utils";
import { TokenAction } from "./ve-token-action";

type VePositionItemProps = {
  props: VeTokenItem;
};

export const VePositionItem: React.FC<VePositionItemProps> = ({ props }) => {
  const id = props.id;
  const token = props.token;
  const { tokenInfo } = useTokenInfo(token, id);
  const { vp, isLoading } = useGetVp(token, id);

  const amount = formatterUtils.formatNumber(formatUnits(tokenInfo?.amount ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const created = new Date(Number(tokenInfo?.start) * 1000 ?? 0);

  const symbol = token === Token.MODE ? "MODE" : "BPT";
  const multiplyer = 2;

  const strEpochs = epochsSince(created.getTime());
  const relativeTime = formatterUtils.formatDate(created.getTime(), {
    format: DateFormat.RELATIVE,
  });

  return (
    <DataListItem key={id.toString()} className="flex items-center gap-x-4 border border-neutral-100 p-4">
      <div className="flex w-16 flex-auto items-center gap-x-3">
        <Image
          className="w-8"
          alt="Token icon"
          width={32}
          height={32}
          src={token === Token.MODE ? "/mode-token-icon.png" : "/bpt-token-icon.png"}
        />
        {id.toString()}
      </div>
      <div className="w-32 flex-auto">
        {amount} {symbol}
      </div>
      <div className="w-32 flex-auto">{multiplyer}x</div>
      <div className="w-32 flex-auto">
        {strEpochs !== "-" ? (
          <>
            {strEpochs} {strEpochs === "1" ? "epoch" : "epochs"}
            <br />
            <small className="text-neutral-200">{relativeTime}</small>
          </>
        ) : (
          <span>-</span>
        )}
      </div>
      <div className="w-48 flex-auto">
        {isLoading ? (
          <div className="flex w-48 flex-auto items-center justify-between gap-x-4">
            <div className="flex items-center justify-between gap-x-4">-</div>;
          </div>
        ) : (
          <TokenAction tokenId={id} token={token} vp={vp ?? 0n} created={created} />
        )}
      </div>
    </DataListItem>
  );
};
