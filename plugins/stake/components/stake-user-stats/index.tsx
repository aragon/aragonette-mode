import React from "react";
import { Token } from "../../types/tokens";
import { NumberFormat, formatterUtils } from "@aragon/ods";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";
import { formatUnits } from "viem";
import GetMoreTokens from "../get-tokens-links";

export const StakeUserStats: React.FC = () => {
  const { vp: modeVp } = useGetAccountVp(Token.MODE);
  const { vp: bptVp } = useGetAccountVp(Token.BPT);

  const balanceMode = formatterUtils.formatNumber(formatUnits(modeVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const balanceBPT = formatterUtils.formatNumber(formatUnits(bptVp ?? 0n, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  return (
    <aside className="flex w-full flex-col gap-y-4 justify-self-center md:max-w-[420px] md:gap-y-6">
      <dl className="divide-y divide-neutral-100">
        <div className="flex flex-col items-baseline gap-y-2 py-3 lg:gap-x-6 lg:py-4">
          <dt className="line-clamp-1 shrink-0 text-xl leading-tight text-neutral-800 lg:line-clamp-6">
            <h2>
              <span className="text-neutral-900">Your active</span> voting power
            </h2>
          </dt>
        </div>

        <div className="grid grid-cols-2 gap-y-3 py-3">
          <p>MODE</p>
          <p className="text-neutral-900">{balanceMode}</p>
        </div>

        <div className="grid grid-cols-2 gap-y-3 py-3">
          <p>BPT</p>
          <p className="text-neutral-900">{balanceBPT}</p>
        </div>
      </dl>
      <GetMoreTokens />
    </aside>
  );
};
