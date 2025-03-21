import { Avatar, Button, DataListItem, IconType, type IInputContainerAlert, InputNumber, Tooltip } from "@aragon/ods";
import React, { useEffect } from "react";
import { type GaugeItem } from "../gauges-list/types";
import { shortenAddress } from "@/utils/address";
import { Token } from "../../types/tokens";
import { useGetVotes } from "../../hooks/useGetVotes";
import { useOwnedTokens } from "../../hooks/useOwnedTokens";
import { formatUnits } from "viem";
import { useGetUsedVp } from "../../hooks/useGetUsedVp";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";

type VotingListItemProps = {
  gauge: GaugeItem;
  modeVotes?: number;
  bptVotes?: number;
  totalModeVotes: number;
  totalBptVotes: number;
  tolerance: number;
  onChange: (token: Token, votes: number) => void;
  onRemove: () => void;
};
export const VotingListItem: React.FC<VotingListItemProps> = ({
  gauge,
  modeVotes,
  bptVotes,
  totalModeVotes,
  totalBptVotes,
  tolerance,
  onChange,
  onRemove,
}) => {
  const { ownedTokens: modeOwnedTokensData } = useOwnedTokens(Token.MODE);
  const { ownedTokens: bptOwnedTokensData } = useOwnedTokens(Token.BPT);

  const modeOwnedTokens = [...(modeOwnedTokensData ?? [])];
  const bptOwnedTokens = [...(bptOwnedTokensData ?? [])];

  const { data: userModeVotesData } = useGetVotes(Token.MODE, [...modeOwnedTokens], gauge.address);
  const { data: userBptVotesData } = useGetVotes(Token.BPT, [...bptOwnedTokens], gauge.address);

  const { data: usedModeVp } = useGetUsedVp(Token.MODE, modeOwnedTokens);
  const { data: usedBptVp } = useGetUsedVp(Token.BPT, bptOwnedTokens);

  const { vp: modeVp } = useGetAccountVp(Token.MODE);
  const { vp: bptVp } = useGetAccountVp(Token.BPT);

  const modePerc = usedModeVp
    ? Math.round((Number(formatUnits(userModeVotesData ?? 0n, 18)) / Number(formatUnits(usedModeVp, 18))) * 100)
    : 0;

  const bptPerc = usedBptVp
    ? Math.round((Number(formatUnits(userBptVotesData ?? 0n, 18)) / Number(formatUnits(usedBptVp, 18))) * 100)
    : 0;

  useEffect(() => {
    if (modeVotes === undefined && modePerc) {
      onChange(Token.MODE, modePerc);
    }
  }, [modeVotes, modePerc, onChange]);

  useEffect(() => {
    if (bptVotes === undefined && bptPerc) {
      onChange(Token.BPT, bptPerc);
    }
  }, [bptVotes, bptPerc, onChange]);

  const getModeAlert = () => {
    return Math.abs(totalModeVotes - 100) >= tolerance && totalModeVotes !== 0
      ? ("critical" as IInputContainerAlert["variant"])
      : undefined;
  };

  const getBptAlert = () => {
    return Math.abs(totalBptVotes - 100) >= tolerance && totalBptVotes !== 0
      ? ("critical" as IInputContainerAlert["variant"])
      : undefined;
  };

  return (
    <DataListItem className="flex flex-col items-center gap-4 md:flex-row">
      <div className="flex w-full flex-auto items-center gap-x-3 md:w-1/4">
        <Avatar
          alt="Gauge icon"
          size="lg"
          src={gauge.metadata?.logo}
          fallback={
            <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
              {gauge.metadata?.name.slice(0, 2)}
            </span>
          }
        />
        <div className="flex flex-col">
          <p className="title text-neutral-900">{gauge.metadata?.name}</p>
          <p className="text-neutral-600">{shortenAddress(gauge.address)}</p>
        </div>
        <div className="flex w-full flex-row-reverse md:hidden">
          <Button
            variant="tertiary"
            size="sm"
            iconLeft={IconType.CLOSE}
            onClick={() => {
              onChange(Token.MODE, 0);
              onChange(Token.BPT, 0);
              onRemove();
            }}
          />
        </div>
      </div>
      <div className="w-full flex-auto md:w-1/4">
        <div className="mx-4 flex flex-row items-center gap-2">
          <Avatar alt="Mode icon" size="sm" src="/mode-token-icon.png" />
          <p className="w-1/5">Mode</p>
          <InputNumber
            value={modeVotes ?? modePerc}
            step={1}
            variant={getModeAlert()}
            disabled={modeVp === 0n}
            suffix="%"
            min={0}
            max={100}
            onChange={(val) => {
              if (val === undefined) return;
              onChange(Token.MODE, Number(val));
            }}
          />
        </div>
      </div>
      <div className="w-full flex-auto md:w-1/4">
        <div className="mx-4 flex flex-row items-center gap-2">
          <Avatar alt="Bpt icon" size="sm" src="/bpt-token-icon.png" />
          <p className="w-1/5">BPT</p>
          <InputNumber
            value={bptVotes ?? bptPerc}
            step={1}
            variant={getBptAlert()}
            disabled={bptVp === 0n}
            suffix="%"
            min={0}
            max={100}
            onChange={(val) => {
              if (val === undefined) return;
              onChange(Token.BPT, Number(val));
            }}
          />
        </div>
      </div>
      <div className="w-1/8 hidden flex-row-reverse md:block">
        <Button
          variant="tertiary"
          size="sm"
          iconLeft={IconType.REMOVE}
          onClick={() => {
            onChange(Token.MODE, 0);
            onChange(Token.BPT, 0);
            onRemove();
          }}
        />
      </div>
    </DataListItem>
  );
};
