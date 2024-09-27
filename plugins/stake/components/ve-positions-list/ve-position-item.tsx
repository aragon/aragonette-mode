import { DataListItem, DateFormat, formatterUtils, NumberFormat } from "@aragon/ods";
import Image from "next/image";
import { formatUnits } from "viem";
import { useGetVp } from "../../hooks/useGetVp";
import { useTokenInfo } from "../../hooks/useTokenInfo";
import { Token } from "../../types/tokens";
import { type VeTokenItem } from "./types";
import { epochsSince } from "./utils";
import { TokenAction } from "./ve-token-action";
import { Fragment } from "react";
import { useNow } from "../../hooks/useNow";

type VePositionItemProps = {
  props: VeTokenItem;
};

export const VePositionItem: React.FC<VePositionItemProps> = ({ props }) => {
  const id = props.id;
  const token = props.token;
  const { tokenInfo } = useTokenInfo(token, id);
  const { vp, isLoading } = useGetVp(token, id);
  const { now } = useNow();

  const amount = formatterUtils.formatNumber(formatUnits(tokenInfo?.amount ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const created = Number(tokenInfo?.start ?? 0n) * 1000;

  const symbol = token === Token.MODE ? "MODE" : "BPT";
  const multiplier = formatterUtils.formatNumber(Math.max(Number((vp ?? 1n) / (tokenInfo?.amount ?? 1n)), 1), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const strEpochs = epochsSince(created, now);
  const diffTime = now - new Date().getTime();
  const relativeTime = formatterUtils.formatDate(created - diffTime, {
    format: DateFormat.RELATIVE,
  });

  return (
    <Fragment>
      <div className="hidden md:block">
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
          <div className="w-32 flex-auto">{multiplier}x</div>
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
              <TokenAction tokenId={id} token={token} vp={vp ?? 0n} created={created} now={now} />
            )}
          </div>
        </DataListItem>
      </div>
      <div className="md:hidden">
        <DataListItem key={id.toString()} className="my-2 border border-neutral-100 px-4 py-2">
          <dl className="flex flex-col divide-y divide-neutral-100">
            <div className="flex justify-between py-2">
              <div className="flex items-center gap-x-4">
                <Image
                  className="w-8"
                  alt="Token icon"
                  width={32}
                  height={32}
                  src={token === Token.MODE ? "/mode-token-icon.png" : "/bpt-token-icon.png"}
                />
                {id.toString()}
              </div>
              <div>
                {amount} {symbol}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="">
                <small>MULTIPLiER</small>
                <br />
                {multiplier}x
              </div>
              <div className="text-right">
                <small>AGE</small>
                <br />
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
            </div>
            <div className="pt-5">
              {isLoading ? (
                <div className="flex w-48 flex-auto items-center justify-between gap-x-4">
                  <div className="flex items-center justify-between gap-x-4">-</div>;
                </div>
              ) : (
                <TokenAction tokenId={id} token={token} vp={vp ?? 0n} created={created} now={now} />
              )}
            </div>
          </dl>
        </DataListItem>
      </div>
    </Fragment>
  );
};
