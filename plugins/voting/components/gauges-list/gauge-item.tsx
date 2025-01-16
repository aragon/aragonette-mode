import { Avatar, Button, DataListItem, formatterUtils, IconType, NumberFormat } from "@aragon/ods";
import { type GaugeItem } from "./types";
import { useEffect, useMemo, useState } from "react";
import { shortenAddress } from "@/utils/address";
import { formatUnits } from "viem";
import { GaugeDetailsDialog } from "./gauge-details-dialog";
import { Token } from "../../types/tokens";
import { useGetAccountVp } from "../../hooks/useGetAccountVp";
import { type ProposalDatum } from "@/server/utils/api/types";
import { formatRewards, ValueOrNone } from "@/utils/numbers";

type GaugeItemProps = {
  props: GaugeItem;
  totalVotes: bigint;
  selected: boolean;
  gaugeVotes: bigint;
  userBPTVotes?: bigint;
  userModeVotes?: bigint;
  bptRewards?: ProposalDatum;
  modeRewards?: ProposalDatum;
  onSelect: (selected: boolean) => void;
};

export const GaugeListItem: React.FC<GaugeItemProps> = ({
  props,
  selected,
  totalVotes: totalVotesBn,
  userBPTVotes,
  userModeVotes,
  gaugeVotes,
  modeRewards,
  bptRewards,
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

  useEffect(() => {
    if (userModeVotesBn > 0n || userBPTVotesBn > 0n) {
      onSelect(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userModeVotesBn, userBPTVotesBn]);

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
          className="mt-2 grid cursor-pointer grid-cols-1 items-center gap-4 border border-neutral-100 p-4 lg:grid-cols-12"
          onClick={() => {
            setOpenDialog(true);
          }}
        >
          {/* Name and Avatar section */}
          <div className="flex items-center gap-x-3 lg:col-span-3">
            <Avatar
              alt="Gauge icon"
              size="lg"
              src={metadata?.logo}
              fallback={
                <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                  {metadata?.name?.slice(0, 2).toUpperCase()}
                </span>
              }
            />
            <div className="flex flex-col">
              <p className="title line-clamp-1 text-neutral-900">{metadata?.name}</p>
              <p className="text-neutral-600">{shortenAddress(props.address)}</p>
            </div>
          </div>

          {/* Stats sections */}
          <div className="flex flex-row items-start justify-between sm:gap-x-4 lg:col-span-6 lg:items-center">
            {/* Total Bribes section */}
            <div className="flex flex-col lg:w-1/3 lg:self-center lg:text-right">
              <p className="mb-1 mt-3 text-neutral-900 lg:hidden">Total Bribes</p>
              {modeRewards?.totalValue === 0 && bptRewards?.totalValue === 0 ? (
                <p className="title text-neutral-700">NONE</p>
              ) : (
                <div className="flex flex-col justify-between lg:text-right">
                  <p className="flex items-center gap-x-1 lg:justify-end">
                    {formatRewards(modeRewards?.totalValue, NumberFormat.FIAT_TOTAL_SHORT, ValueOrNone.VALUE)}
                    <Avatar alt="Mode Token icon" className="!md:size-5 !size-4" src="/mode-token-icon.png" />
                  </p>
                  <p className="flex items-center gap-x-1 lg:justify-end">
                    {formatRewards(bptRewards?.totalValue, NumberFormat.FIAT_TOTAL_SHORT, ValueOrNone.VALUE)}
                    <Avatar alt="BPT Token icon" className="!md:size-5 !size-4" src="/bpt-token-icon.png" />
                  </p>
                </div>
              )}
            </div>
            {/* Total Votes section */}
            <div className="flex flex-col justify-between lg:w-1/3 lg:text-right">
              <p className="mb-1 mt-3 text-neutral-900 lg:hidden">Total votes</p>
              <p>
                {gaugeTotalVotes} <span className="title text-xs text-neutral-600">votes</span>
              </p>
              <p>
                {formattedPercentage}% <span className="title text-xs text-neutral-600">of total</span>
              </p>
            </div>

            {/* User Votes section */}
            <div className="flex flex-col justify-between lg:w-1/3 lg:self-center lg:text-right">
              <p className="mb-1 mt-3 text-neutral-900 lg:hidden">Your votes</p>
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

          {/* Button section */}
          <div className="flex items-center justify-end lg:col-span-3">
            <Button
              size="sm"
              disabled={!hasBalance}
              variant={selected ? "primary" : "tertiary"}
              iconLeft={selected ? IconType.CHECKMARK : undefined}
              className="btn btn-primary w-full transition-none disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
              onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
                ev.stopPropagation();
                onSelect(!selected);
              }}
            >
              {selected ? "Selected" : hasBalance ? "Select to vote" : "Stake to vote"}
            </Button>
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
                      {metadata?.name?.slice(0, 2).toUpperCase()}
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
