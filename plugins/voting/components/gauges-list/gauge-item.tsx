import { Avatar, Button, DataListItem, formatterUtils, IconType, NumberFormat } from "@aragon/ods";
import { type GaugeItem } from "./types";
import { useMemo, useState } from "react";
import { shortenAddress } from "@/utils/address";
import { formatUnits } from "viem";
import { GaugeDetailsDialog } from "./gauge-details-dialog";
import { Token } from "../../types/tokens";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";

type GaugeItemProps = {
  props: GaugeItem;
  totalVotes: bigint;
  selected: boolean;
  gaugeVotes: bigint;
  userBPTVotes?: bigint;
  userModeVotes?: bigint;
  onSelect: (selected: boolean) => void;
};

export const GaugeListItem: React.FC<GaugeItemProps> = ({
  props,
  selected,
  totalVotes: totalVotesBn,
  userBPTVotes,
  userModeVotes,
  gaugeVotes,
  onSelect,
}) => {
  const metadata = props.metadata;
  const [openDialog, setOpenDialog] = useState(false);

  const { vp: modeVp } = useGetAccountVp(Token.MODE);
  const { vp: bptVp } = useGetAccountVp(Token.BPT);

  const hasBalance = !((!modeVp || modeVp === 0n) && (bptVp === 0n || !bptVp));

  const userModeVotesBn = useMemo(() => userModeVotes ?? 0n, [userModeVotes]);
  const userBPTVotesBn = useMemo(() => userBPTVotes ?? 0n, [userBPTVotes]);

  const modeUserVotes = formatterUtils.formatNumber(formatUnits(userModeVotesBn, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const bptUserVotes = formatterUtils.formatNumber(formatUnits(userBPTVotesBn, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });
  const gaugeTotalVotes = formatterUtils.formatNumber(formatUnits(gaugeVotes, 18), {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  const percentage = (Number(formatUnits(gaugeVotes, 18)) / Number(formatUnits(totalVotesBn, 18))) * 100;
  const formattedPercentage = formatterUtils.formatNumber(percentage ?? 0, {
    format: NumberFormat.TOKEN_AMOUNT_SHORT,
  });

  return (
    <>
      <div>
        <GaugeDetailsDialog
          selectedGauge={props}
          openDialog={openDialog}
          onClose={() => {
            setOpenDialog(false);
          }}
        />
        <DataListItem
          key={metadata?.name}
          className="mt-2 flex flex-col gap-x-4 border border-neutral-100 p-4 md:flex-row md:items-center"
          onClick={() => {
            setOpenDialog(true);
          }}
        >
          <div className="flex w-full flex-row items-center gap-x-3 md:w-1/6">
            <Avatar
              alt="Gauge icon"
              size="lg"
              src={metadata?.logo}
              fallback={
                <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                  {metadata?.name.slice(0, 2).toUpperCase()}
                </span>
              }
            />
            <div className="flex flex-col">
              <p className="title text-neutral-900">{metadata?.name}</p>
              <p className="text-neutral-600">{shortenAddress(props.address)}</p>
            </div>
          </div>
          <div className="flex w-full flex-row md:w-3/6">
            <div className="my-2 flex w-1/2 flex-col md:my-0 md:text-right">
              <p className="mb-1 mt-3 text-neutral-900 md:hidden">Total votes</p>
              <p>
                {gaugeTotalVotes} <span className="title text-xs text-neutral-600">votes</span>
              </p>
              <p>
                {formattedPercentage}% <span className="title text-xs text-neutral-600">of total</span>
              </p>
            </div>
            <div className="my-2 flex w-1/2 flex-col justify-start md:my-0 md:justify-center md:text-right">
              <p className="mb-1 mt-3 text-neutral-900 md:hidden">Your votes</p>
              {userModeVotes || userBPTVotes ? (
                <>
                  <p>
                    {modeUserVotes} <span className="title text-xs text-neutral-600">Mode</span>
                  </p>
                  <p>
                    {bptUserVotes} <span className="title text-xs text-neutral-600">BPT</span>
                  </p>
                </>
              ) : (
                <p className="title text-neutral-700">None</p>
              )}
            </div>
          </div>
          <div className="w-full flex-auto md:w-1/6">
            <div className="flex flex-row-reverse">
              <Button
                size="sm"
                disabled={!hasBalance}
                variant={selected ? "primary" : "tertiary"}
                iconLeft={selected ? IconType.CHECKMARK : undefined}
                className="btn btn-primary w-full transition-none disabled:cursor-not-allowed disabled:opacity-50 md:w-1/2"
                onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
                  ev.stopPropagation();
                  onSelect(!selected);
                }}
              >
                {selected ? "Selected" : hasBalance ? "Select to vote" : "Stake to vote"}
              </Button>
            </div>
          </div>
        </DataListItem>
      </div>
      <div className="hidden">
        <DataListItem key={metadata?.name} className="my-2 border border-neutral-100 px-4 py-2">
          <dl className="flex flex-col divide-y divide-neutral-100">
            <div className="flex justify-between py-2">
              <div className="flex items-center gap-x-4">
                <Avatar
                  alt="Gauge icon"
                  size="lg"
                  src={metadata?.logo}
                  fallback={
                    <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                      {metadata?.name.slice(0, 2).toUpperCase()}
                    </span>
                  }
                />
                {metadata?.name}
              </div>
              <div>{gaugeTotalVotes}</div>
            </div>
          </dl>
        </DataListItem>
      </div>
    </>
  );
};
