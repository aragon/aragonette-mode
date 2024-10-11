import { Avatar, Button, DataListItem, IconType, InputNumber } from "@aragon/ods";
import React from "react";
import { type GaugeItem } from "../gauges-list/types";
import { shortenAddress } from "@/utils/address";
import { Token } from "../../types/tokens";

type VotingListItemProps = {
  gauge: GaugeItem;
  modeVotes: number;
  bptVotes: number;
  onChange: (token: Token, votes: number) => void;
  onRemove: () => void;
};
export const VotingListItem: React.FC<VotingListItemProps> = ({ gauge, modeVotes, bptVotes, onChange, onRemove }) => {
  return (
    <DataListItem className="flex items-center">
      <div className="flex w-1/4 flex-auto items-center gap-x-3">
        <Avatar
          alt="Gauge icon"
          size="lg"
          src={gauge.metadata?.logo}
          fallback={
            <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">PN</span>
          }
        />
        <div className="flex flex-col">
          <div>{gauge.metadata?.name}</div>
          <div>{shortenAddress(gauge.address)}</div>
        </div>
      </div>
      <div className="w-1/4 flex-auto">
        <div className="mx-4 flex flex-row items-center gap-2">
          <div>Mode</div>
          <Avatar alt="Mode icon" size="sm" src="/mode-token-icon.png" />
          <InputNumber
            value={modeVotes}
            suffix="%"
            min={0}
            max={100}
            onChange={(val) => onChange(Token.MODE, Number(val))}
          />
        </div>
      </div>
      <div className="w-1/4 flex-auto">
        <div className="mx-4 flex flex-row items-center gap-2">
          <div>BPT</div>
          <Avatar alt="Bpt icon" size="sm" src="/bpt-token-icon.png" />
          <InputNumber
            value={bptVotes}
            suffix="%"
            min={0}
            max={100}
            onChange={(val) => onChange(Token.BPT, Number(val))}
          />
        </div>
      </div>
      <div className="w-1/8 flex-row-reverse">
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
    </DataListItem>
  );
};
